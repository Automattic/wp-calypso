# calypso-notices

This library provides a generic system for UI notifications for React components.

## NoticesProvider

The provider component should be used to wrap around your entire application, or at least the part that will be generating notices. It enable use of the [useNoticeActions](#useNoticeActions) and [useCurrentNotices](#useCurrentNotices) hooks and their higher-order-component counterparts.

```js
<NoticesProvider>
  // Your application here
</NoticesProvider>
```

## useCurrentNotices

A React hook to return the notices that should currently be displayed. Use this in whatever component displays your notices.

See [withCurrentNotices](#withCurrentNotices) if you are not able to use React hooks.

```ts
const notices: NoticeData[] = useCurrentNotices();
```

```ts
type NoticeStatusError = 'is-error';
type NoticeStatusInfo = 'is-info';
type NoticeStatusSuccess = 'is-success';
type NoticeStatusWarning = 'is-warning';
type NoticeStatus =
  | NoticeStatusError
  | NoticeStatusInfo
  | NoticeStatusSuccess
  | NoticeStatusWarning;

type NoticeData {
  noticeId: string;
  status: NoticeStatus;
  text: string | React.ReactNode;
}
```

## useNoticeActions

A React hook to return the common notice actions. See [withNoticeActions](#withNoticeActions) if you are not able to use React hooks.

```ts
const {
  updateNoticesForRouteChange: () => void;
  removeNotice: ( id: string ) => void;
  errorNotice: NoticeFunction;
  warningNotice: NoticeFunction;
  infoNotice: NoticeFunction;
  successNotice: NoticeFunction;
} = useNoticeActions();
```

The notice functions all have the following API:

```ts
type NoticeFunction = ( noticeContent: string | React.ReactNode, options?: NoticeOptions ) => void;
```

The optional `NoticeOptions` object has the following type:

```ts
{
  id?: string; // A unique ID for your notice which can be used to remove it later.
  duration?: number; // A duration in milliseconds to display the notice before automatically removing it.
  showDismiss?: boolean; // Default true. If set, a button will be rendered alongside the notice to manually remove it.
  isPersistent?: boolean; // Default false. If not set, the notice will be removed when the route changes.
  displayOnNextPage?: boolean; // Default false. If set, the notice will not be shown until the route changes.
  button?: string; // If set, an action button will be rendered alongside the notice with this text. See href and onClick options.
  href?: string; // A URL. If button is also set, the action button will visit this URL.
  onClick?: () => void; // A callback function. If button is also set, the action button will call this callback.
}
```

### updateNoticesForRouteChange

A function that should be called when a route changes within a Single Page Application. By default, it will clear all displayed notices, except those for which `isPersistent` is set, and it may display notices for which `displayOnNextPage` is true.

### removeNotice

Can be used to programmatically remove a notice by ID.

## withNoticeActions

A React higher-order-component which provides the same data as [useNoticeActions](#useNoticeActions) as props to the wrapped component.

## withCurrentNotices

A React higher-order-component which provides the same data as [useCurrentNotices](#useCurrentNotices) as the `notices` prop to the wrapped component.
