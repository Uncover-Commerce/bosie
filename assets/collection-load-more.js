const products_on_page = document.getElementById('product-grid');
const nextUrl = document.getElementById('paginateNext');
let next_url = nextUrl.dataset.nextUrl;

const load_more_btn = document.getElementsByClassName('load-more_btn')[0];
const load_more_spinner = document.getElementsByClassName('load-more_spinner')[0];
async function getNextPage() {
  try {
    let res = await fetch(next_url);
    return await res.text();
  } catch (error) {
    console.log(error);
  }
}

async function loadMoreProducts() {
  load_more_btn.style.display = 'none';
  load_more_spinner.style.display = 'block';
  let nextPage = await getNextPage();

  const parser = new DOMParser();
  const nextPageDoc = parser.parseFromString(nextPage, 'text/html');

  load_more_spinner.style.display = 'none';

  const productgrid = nextPageDoc.getElementById('product-grid');
  const new_products = Array.from(productgrid.getElementsByClassName('grid__item'));
  const newUrl = nextPageDoc.getElementById('paginateNext');
  const new_url = newUrl ? newUrl.dataset.nextUrl : null;
  if (new_url) {
    load_more_btn.style.display = 'flex';
    next_url = new_url;
  } else {
    load_more_btn.style.display = 'none';
  }

  new_products.forEach((product) => products_on_page.appendChild(product));
}
