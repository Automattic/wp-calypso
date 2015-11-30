# Global notices, application state and Redux

@mtias and me are working on streamlining notices in PR #888
We are planning to separate global notices into seperate component, put it in the global application state and reduxify.
All is well in the world.

Single global notice could have a definition like this one:
```
{
   text: '',
   expiresIn: '',
   className: '',
   type: warning/info/error,
   icon: '',
   action: {
       href: '',
       target: '',
       className: '',
       icon: '',
       text: '',
       onClick: 
   }
}
```

## Problem
Problem is this `onClick` prop. Callbacks in global notice component are a tricky thing.

1. They are not serializable, so we cannot benefit from state serialization
2. State can change and callback stays the same
3. Context can switch

### For now
For now we will allow only for `href` action for global notices. It should be enough, but we'll see

# REDUX-y approach

I am not a redux expert and that's why I'm starting this discussion.

BUT.

Seems to me, that callback can be represented by a redux action like:
```
{
    type: SITES_REFRESH
    siteId:....
}
```

Then this redux action would trigger proper application behaviour.

So, clicking NoticeAction would trigger a redux action and that would take it from here.
This redux action is already in plain Object format, so it's a perfect candidate for hiolding in a store.

We would have to reduxify everything that we want to trigger with this kind of parameter handling.


### I have no idea if that makes sense
I just wanted to start a discussion.
Meanwhile I will read more about redux.
