class UncoverDropdown extends HTMLElement {
  constructor() {
    super();
    this.currentProductID = null;
    this.btnEventListeners();
    this.getProductID(true);
  }

  btnEventListeners() {
    const { dropdownButtons, selectbuttons } = this.dropdownComponents();

    dropdownButtons.forEach((dropdownButton) => {
      dropdownButton.addEventListener('click', () => {
        this.toggleDropdownNavigation(dropdownButton);
      });
    });

    document.addEventListener('click', (event) => {
      if (!this.contains(event.target)) {
        this.hideAllDropdowns();
      }
    });

    selectbuttons.forEach((select) => {
      select.addEventListener('click', () => {
        this.selectDropdownOption(select);
      });
    });
  }

  selectDropdownOption(selectOption) {
    const { brushingProduct, currencyFormat } = this.dropdownComponents();
    let optionTitle = selectOption.dataset.title;
    let optionPrice = selectOption.dataset.price;
    let optionID = selectOption.dataset.product;
    let optionRawPrice = selectOption.dataset.rawprice;

    let mainContainer = selectOption.parentElement.parentElement;
    let dropdownTItle = mainContainer.querySelector('#dropdown-title');
    let dropdownArrow = mainContainer.querySelector('#dropdown-arrow');
    let brushingFooter = document.querySelector('.brushing-footer');

    if (dropdownArrow.querySelector('p') != null) {
      dropdownArrow.querySelector('p').remove();
    }

    //Hide arrow and show price
    if (optionPrice != null) {
      dropdownArrow.querySelector('svg').style.display = 'none';
      let newPrice = document.createElement('p');
      newPrice.textContent = optionPrice;
      dropdownArrow.appendChild(newPrice);
      if (brushingFooter != null) {
        brushingFooter.classList.add('dropdown-active-footer');
      }
      brushingProduct.dataset.price = optionRawPrice;
      brushingProduct.dataset.id = optionID;
      brushingProduct.dataset.note = `${optionTitle} (+ ${formatMoney(optionRawPrice, currencyFormat)})`;

      this.updateProductNote(`${optionTitle} (+ ${formatMoney(optionRawPrice, currencyFormat)})`);
      this.updateProductPrice(optionRawPrice);
    } else {
      dropdownArrow.querySelector('svg').style.display = 'block';

      brushingProduct.dataset.price = '';
      brushingProduct.dataset.id = '';
      brushingProduct.dataset.note = '';

      const { productForm } = this.dropdownComponents();
      if (productForm != null) {
        if (productForm.querySelector('#product-brush-note') != null) {
          productForm.querySelector('#product-brush-note').remove();
        }
      }

      this.updateProductPrice(null);

      if (brushingFooter != null) {
        brushingFooter.classList.remove('dropdown-active-footer');
      }
    }

    //Update main option price and title
    dropdownTItle.textContent = optionTitle;

    //Close dropdown
    this.hideAllDropdowns();
  }

  updateProductPrice(price) {
    const { currencyFormat } = this.dropdownComponents();

    const priceElements = document.querySelectorAll('.price-item--regular');
    const priceSaleElement = document.querySelectorAll('.price-item--sale');

    const currentVariantData = document.querySelector(`#variant-${this.currentProductID}`);

    const variantPrice = currentVariantData.dataset.price;
    const variantComparePrice = currentVariantData.dataset.compare;

    //Revert to priginal product price
    if (price == null) {
      priceElements.forEach((priceElement) => {
        if (variantComparePrice !== '') {
          priceElement.textContent = formatMoney(Number(variantComparePrice), currencyFormat);
        } else {
          priceElement.textContent = formatMoney(Number(variantPrice), currencyFormat);
        }
      });
      priceSaleElement.forEach((salePriceElement) => {
        salePriceElement.textContent = formatMoney(variantPrice, currencyFormat);
      });
      return;
    }

    //Update product price with brushing selected
    let totalPrice = Number(variantPrice) + Number(this.removeCurrencyFormat(price));
    totalPrice = formatMoney(totalPrice, currencyFormat);
    let comparePrice = formatMoney(
      Number(variantComparePrice) + Number(this.removeCurrencyFormat(price)),
      currencyFormat
    );

    priceElements.forEach((price) => {
      price.textContent = variantComparePrice === '' ? totalPrice : comparePrice;
    });

    if (variantComparePrice !== '') {
      priceSaleElement.forEach((salePriceElement) => {
        salePriceElement.textContent = totalPrice;
      });
    }
  }

  toggleDropdownNavigation(dropdownButton) {
    let mainContainer = dropdownButton.parentElement;
    let contentContainer = mainContainer.querySelector('.dropdown-content');

    // if(contentContainer.classList.contains('hidden-dropdown')) {

    // }

    contentContainer.classList.toggle('hidden-dropdown');
  }

  removeCurrencyFormat(value) {
    return value.replace(/[^\d.]/g, '');
  }

  removeDotsAndCommas(value) {
    return value.replace(/[.,]/g, '');
  }

  hideAllDropdowns() {
    const { allDropdownContent } = this.dropdownComponents();

    allDropdownContent.forEach((dropdownContent) => {
      dropdownContent.classList.add('hidden-dropdown');
    });
  }

  updateProductNote(productNote) {
    const { productForm } = this.dropdownComponents();
    if (productForm != null) {
      if (productForm.querySelector('#product-brush-note') != null) {
        productForm.querySelector('#product-brush-note').remove();
      }

      let newProductInput = document.createElement('input');
      newProductInput.type = 'hidden';
      newProductInput.name = 'properties[Brushing]';
      newProductInput.id = 'product-brush-note';
      newProductInput.value = productNote;
      productForm.appendChild(newProductInput);
    }
  }

  getProductID(initLoad = false) {
    const productForm = document.querySelector('.product-form');

    if (!productForm) return;

    const updateProductID = () => {
      const selectedVariant = productForm.querySelector('[name="id"]').value;
      this.currentProductID = selectedVariant;
    };

    if (initLoad) {
      updateProductID(); // Get the product ID on initial load if specified
    }

    productForm.addEventListener('change', updateProductID);
  }

  dropdownComponents() {
    const dropdownButtons = this.querySelectorAll('.dropdown-button');
    const allDropdownContent = this.querySelectorAll('.dropdown-content');
    const selectbuttons = this.querySelectorAll('.select-button');
    const productForm = document.querySelector('.product-form').querySelector('form');
    const currencyFormat = document.getElementById('cart-currency-format').getAttribute('data-format');
    const brushingProduct = this.querySelector('#brushing-product');
    const currencySymbol = document.querySelector('#cart-currency-symbol').getAttribute('data-symbol');
    const productPrice = document.querySelector('#product-price').getAttribute('data-price');

    return {
      dropdownButtons,
      allDropdownContent,
      selectbuttons,
      productForm,
      brushingProduct,
      currencyFormat,
      currencySymbol,
      productPrice,
    };
  }
}

class BrushingModal extends HTMLElement {
  constructor() {
    super();
    this.btnEventListeners();
  }

  btnEventListeners() {
    const { modalExitButton, modalTriggetBtn } = this.modalComponents();

    modalExitButton.addEventListener('click', () => {
      this.closeModal();
    });

    modalTriggetBtn.addEventListener('click', () => {
      this.openModal();
    });
  }

  closeModal() {
    this.classList.add('hidden');
  }

  openModal() {
    this.classList.remove('hidden');
  }

  modalComponents() {
    const modalContainer = this.querySelector('.brushing-modal');
    const modalExitButton = this.querySelector('.brushing-exit-button');
    const modalTriggetBtn = document.querySelector('.brushing-link');

    return { modalContainer, modalExitButton, modalTriggetBtn };
  }
}

customElements.define('brushing-modal', BrushingModal);
customElements.define('uncover-dropdown', UncoverDropdown);
