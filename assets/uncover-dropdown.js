console.log('Uncover dropdown!');
class UncoverDropdown extends HTMLElement {
  constructor() {
    super();
    this.btnEventListeners();
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
    let optionTitle = selectOption.dataset.title;
    let optionPrice = selectOption.dataset.price;

    let mainContainer = selectOption.parentElement.parentElement;
    let dropdownTItle = mainContainer.querySelector('#dropdown-title');
    let dropdownArrow = mainContainer.querySelector('#dropdown-arrow');

    if (dropdownArrow.querySelector('p') != null) {
      dropdownArrow.querySelector('p').remove();
    }

    //Hide arrow and show price
    if (optionPrice != null) {
      dropdownArrow.querySelector('svg').style.display = 'none';
      let newPrice = document.createElement('p');
      newPrice.textContent = optionPrice;
      dropdownArrow.appendChild(newPrice);
    } else {
      dropdownArrow.querySelector('svg').style.display = 'block';
    }

    //Update main option price and title
    dropdownTItle.textContent = optionTitle;
    console.log(selectOption);

    //Close dropdown
    this.hideAllDropdowns();
  }

  toggleDropdownNavigation(dropdownButton) {
    let mainContainer = dropdownButton.parentElement;
    let contentContainer = mainContainer.querySelector('.dropdown-content');

    // if(contentContainer.classList.contains('hidden-dropdown')) {

    // }

    contentContainer.classList.toggle('hidden-dropdown');

    console.log('Toggle dropdown navigation!');
  }

  hideAllDropdowns() {
    const { allDropdownContent } = this.dropdownComponents();

    allDropdownContent.forEach((dropdownContent) => {
      dropdownContent.classList.add('hidden-dropdown');
    });
  }

  dropdownComponents() {
    const dropdownButtons = this.querySelectorAll('.dropdown-button');
    const allDropdownContent = this.querySelectorAll('.dropdown-content');
    const selectbuttons = this.querySelectorAll('.select-button');

    return { dropdownButtons, allDropdownContent, selectbuttons };
  }
}

customElements.define('uncover-dropdown', UncoverDropdown);
