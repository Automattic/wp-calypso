# SiftScience Loader

`SiftScience` is a 3rd party service we're using to help flag purchase fraud. On the client side, it sends some data about the user's environment to help determine whether or not they're fraud.

For any route we'd like to collect user data for sift, simply include `recordSiftScienceUser();` as an Express.js route handler. This fills out the window.\_sift object as required, and loads the external sift script. Nothing needs to be done beyond that. At this point, we're not tracking pageviews with sift, we're only sending data about user environments - so we don't need to call `recordSiftScienceUser()` on each pageload, only once before they checkout.
