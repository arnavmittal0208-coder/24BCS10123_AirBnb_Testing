Cypress.Commands.add('dismissPriceDisclosure', () => {
  cy.get('body').then($body => {
    const gotIt = [...$body.find('button')].find(button =>
      /^got it$/i.test(button.innerText.trim()) && Cypress.$(button).is(':visible')
    );

    if (gotIt) cy.wrap(gotIt).click();
  });
});
