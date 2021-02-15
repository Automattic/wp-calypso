# Accessible-focus

This module is run at client startup and listens for keyboard events to determine if the user is navigating the page by keyboard. Clicking the tab, arrows, or space keys is considered keyboard navigation.

When keyboard navigation is detected, the class `accessible-focus` is added to the document's html element. This class can be used to show a dotted outline effect around focused elements to assist the user in keyboard navigation.

The class is removed again upon detection of a click event, which indicates the user is navigating with the mouse.
