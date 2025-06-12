# Reactivity and Loading States

One of the guiding principles of Calypso is to minimize delays between the user, the interface, and the data, in order to construct an experience that feels fast and responsive. It tries to avoid _ad hoc_ state and fragmentation of truth by simplifying the data flow, making the final render just a representation of the current data state. For this we require view modules to be able to react to data changes elegantly, no matter how those changes are being retrieved. If something changes on the server, Calypso needs to be able to reflect that without user intervention. Some of these updates may require optimizations done on the UI to convey something has changed, naturally. That depends on the nature of the area you are working with.

## Avoid Loading Spinners!

In conjunction with this approach to reactivity, we encourage developers to think about the information they have available at any given time, and to utilize it to represent the visual states of their components — make the most use of what is already known, and anticipate results when you can.

If you visit `/sites`, and you are logged in, we can already infer from `user.visible_site_count` how many sites you have, we don't need to wait for the sites endpoint to return the data. We also know the general shape of the visual representation of these sites in Calypso, because they follow a pattern. That means we can, as soon as we render the page, paint the correct number of sites with their appropriate design blueprints on the screen, and then convey with a pulsing animation that data is coming. As soon as data arrives, and in concordance with the reactive principle, we update the interface.

Example: <https://cloudup.com/c1K2ZOGDzbI>

## Resources

- [7 Principles of Rich Web Applications](http://rauchg.com/2014/7-principles-of-rich-web-applications/)
- [The Need for Speed](https://cloudup.com/blog/the-need-for-speed)
