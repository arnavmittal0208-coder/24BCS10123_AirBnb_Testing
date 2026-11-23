const openHome = () => {
  cy.visit('/');
  cy.dismissPriceDisclosure();
};

const openParisResults = () => {
  cy.visit('/s/Paris--France/homes');
  cy.dismissPriceDisclosure();
  cy.get('main').should('be.visible');
};

const openFirstListing = () => {
  openParisResults();
  cy.get('a[href*="/rooms/"]').filter(':visible').first().invoke('attr', 'href').then(href => {
    cy.visit(href);
  });
  cy.location('pathname').should('include', '/rooms/');
};

describe('Airbnb E2E', () => {
  it('1. loads the Airbnb homepage', () => {
    openHome();
    cy.title().should('match', /Airbnb/i);
    cy.get('main').should('be.visible');
  });

  it('2. displays the Airbnb brand and navigation', () => {
    openHome();
    cy.get('a[aria-label*="Airbnb"], a[href="/"]').filter(':visible').first().should('be.visible');
    cy.get('header').should('be.visible');
  });

  it('3. displays the destination search control', () => {
    openHome();
    cy.get('button:visible').should('have.length.greaterThan', 0);
    cy.get('body').should($body => expect($body.text()).to.match(/Where|Homes|Anywhere/i));
  });

  it('4. opens Paris search results', () => {
    openParisResults();
    cy.location('pathname').should('include', '/s/');
    cy.get('body').should('contain.text', 'Paris');
  });

  it('5. shows accommodation cards in the results', () => {
    openParisResults();
    cy.get('a[href*="/rooms/"]').filter(':visible').should('have.length.greaterThan', 0);
  });

  it('6. shows photos for the accommodation results', () => {
    openParisResults();
    cy.get('img[data-image-component-source="AIRIMAGE"]:visible').should('have.length.greaterThan', 0);
  });

  it('7. shows pricing information in search results', () => {
    openParisResults();
    cy.get('body').should($body => expect($body.text()).to.match(/\u20b9|\$|\u20ac|\u00a3/));
  });

  it('8. displays the search filters control', () => {
    openParisResults();
    cy.get('button:visible').contains(/^Filters$/i).should('be.visible');
  });

  it('9. shows amenity shortcuts on the results page', () => {
    openParisResults();
    cy.get('body').should($body => expect($body.text()).to.match(/Kitchen|Wifi|Free parking|Air conditioning/i));
  });

  it('10. shows the map alongside search results', () => {
    openParisResults();
    cy.get('body').should($body => expect($body.text()).to.match(/Map data|Map Data|Google/i));
  });

  it('11. searches Mumbai and selects an Airbnb listing', () => {
    cy.visit('/s/Mumbai--India/homes');
    cy.dismissPriceDisclosure();
    cy.location('pathname').should('match', /\/s\/.*Mumbai/i);
    cy.get('a[href*="/rooms/"]').filter(':visible').should('have.length.greaterThan', 0);
    cy.get('a[href*="/rooms/"]').filter(':visible').first().invoke('attr', 'href').then(href => {
      cy.visit(href);
    });
    cy.location('pathname').should('include', '/rooms/');
    cy.get('h1').filter(':visible').first().should('be.visible');
  });

  it('12. displays listing photos and details', () => {
    openFirstListing();
    cy.get('h1').filter(':visible').first().should('be.visible');
    cy.get('img:visible').should('have.length.greaterThan', 0);
  });
});
