# Follow List

## FollowList

If you have components that utlize 'Follow' actions for users, the follow-list acts as a central store for all site/follow data. So if a user clicks follow within one component, all other associated follow buttons can be updated by an emitted change event.

```js
import FollowList from 'follow-list';
const followList = FollowList();
```

### add( { site_id: site.ID, is_following: true } )

If the `site_id` being passed in does not yet exist in the array of `followList` data, a new `FollowListSite` object is created and added to the array. The method returns the instance of the `FollowListSite` so you can use that object to subscribe to change events:

```js
const newFollowListSite = followList.add( { site_id: 1, is_following: false } );

// then in a jsx component

<Component mixins={ [ observe( 'newFollowListSite' ) ] } />;
```

## FollowListSite

Instances of `FollowListSite` are created using the steps outlined above.

### follow()

If the `is_following === false` this method will call the api to start following the site. Once the api operation complets, a change event is fired.

### unfollow()

If the `is_following === true` this method will call the api to stop following the site. Once the api operation complets, a change event is fired.

## Module Dependencies

## External Dependencies

- `EventEmitter` to send `change` events which are subscribed to via the `mixins\data-observe` within your jsx component.

## Internal Dependencies

- `wp` for api operations

## Tests

Execute `make` from the root of the directory
