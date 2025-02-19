class ShippingBar {
  initFreeShippingBar() {
    let shippingBar = document.getElementById('drawer-free-shipping-bar');
    if (shippingBar) {
      this.updateShippingBar(shippingBar);
    }
  }

  async updateShippingBar(shippingBar) {
    const supportedCurrencies = ['GBP', 'EUR', 'USD'];
    let currentCurrency = window.Shopify.currency.active || 'GBP'; // Defaults to GBP

    let cartTotal = await this.getCartTotal();
    if (cartTotal === null) return;

    let moneyFormat = shippingBar.dataset.moneyFormat.replace(/<[^>]*>/g, ''); // Remove HTML tags
    let formattedCartTotal = this.formatMoney(cartTotal, moneyFormat);

    // Ensure currentCartTotal is correctly extracted and parsed
    let currentCartTotal = this.extractNumber(formattedCartTotal);

    if (!shippingBar) return;

    console.log(`Current cart total: ${currentCartTotal}`);

    if (!supportedCurrencies.includes(currentCurrency) || currentCartTotal == 0) {
      shippingBar.style.display = 'none';
      return;
    }

    shippingBar.style.display = 'block';
    let shippingRate = this.getShippingThreshold(shippingBar, currentCurrency);

    if (isNaN(currentCartTotal) || isNaN(shippingRate)) {
      console.error('Error: Invalid cart total or shipping rate');
      return;
    }

    let priceDifference = shippingRate - currentCartTotal;
    let shippingBarTitle = shippingBar.querySelector('#shipping-bar-title');
    let shippingBarProgress = shippingBar.querySelector('#shipping-bar-progress');

    if (priceDifference <= 0) {
      shippingBarTitle.innerHTML = shippingBar.dataset.achieveFreeShipping;
    } else {
      let titlePrice = shippingBar.dataset.currency + priceDifference.toFixed(2);
      let prepSectionTitle = shippingBar.dataset.sectionTitle.replace('{PRICE}', titlePrice);
      shippingBarTitle.innerHTML = prepSectionTitle;
    }

    let percentage = (currentCartTotal / shippingRate) * 100;
    shippingBarProgress.style.width = `${Math.min(percentage, 100)}%`;
  }

  formatMoney(cents, format) {
    if (typeof cents == 'string') {
      cents = cents.replace('.', '');
    }
    let value = '';
    let placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    let money_format = '{{ shop.money_format }}';
    let formatString = format || money_format;

    function defaultOption(opt, def) {
      return typeof opt == 'undefined' ? def : opt;
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = defaultOption(precision, 2);
      thousands = defaultOption(thousands, ',');
      decimal = defaultOption(decimal, '.');

      if (isNaN(number) || number == null) {
        return 0;
      }

      number = (number / 100.0).toFixed(precision);

      let parts = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents = parts[1] ? decimal + parts[1] : '';

      return dollars + cents;
    }

    switch (formatString.match(placeholderRegex)[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  }

  extractNumber(priceString) {
    // Remove all non-numeric characters except . and , (for decimals)
    let cleanedString = priceString.replace(/[^\d.,]/g, '');

    // If the number uses a comma as a decimal separator, replace it with a dot
    if (cleanedString.includes(',') && cleanedString.includes('.')) {
      cleanedString = cleanedString.replace(/,/g, '');
    } else if (cleanedString.includes(',')) {
      cleanedString = cleanedString.replace(',', '.');
    }

    let numberValue = parseFloat(cleanedString);
    return isNaN(numberValue) ? 0 : numberValue;
  }

  getShippingThreshold(shippingBar, currency) {
    let rates = {
      GBP: parseFloat(shippingBar.dataset.shippingRatePounds) || 0,
      USD: parseFloat(shippingBar.dataset.shippingRateDollars) || 0,
      EUR: parseFloat(shippingBar.dataset.shippingRateEuros) || 0,
    };

    return rates[currency] || rates['GBP'];
  }

  async getCartTotal() {
    try {
      let response = await fetch('/cart.js');
      let cart = await response.json();
      return cart.total_price;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let shippingBar = new ShippingBar();
  shippingBar.initFreeShippingBar();

  document.addEventListener('cart:updated', () => {
    shippingBar.initFreeShippingBar();
  });

  document.addEventListener('currency:changed', () => {
    shippingBar.initFreeShippingBar();
  });

  // Detect when an item is added to the cart
  document.querySelectorAll('form[action$="/cart/add"]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      let formData = new FormData(form);

      try {
        let response = await fetch(form.action, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          let cartResponse = await fetch('/cart.js');
          let cartData = await cartResponse.json();
          document.dispatchEvent(new CustomEvent('cart:updated', { detail: cartData }));
        } else {
          console.error('Error adding to cart:', response.statusText);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    });
  });
});
