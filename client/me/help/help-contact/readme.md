# HelpContact

`HelpContact` renders a form enabling the customer to request help.
The rendered form will be rendered dynamically based on the customer, showing one of a number of variations that is most relevant to that customer.

The form variations will allow the customer to either:

- Start a HappyChat session
- Post a support ticket to forums.wordpress.com
- Start a session with Directly
- Open a Happiness ticket

To better understand under which consitions each variation is shown, look for `getSupportVariation` in `index.js
