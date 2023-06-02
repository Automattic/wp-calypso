# Videos UI

The Videos UI is meant to show a full screen video showcase. The UI can be adapted to different
contexts by customizing the header and footer components.

When the component is loaded it will make a request to the API using the `useCourseData` selector
to fetch the course information.

## Basic usage

In this example we will be using the `ModalHeaderBar` and `ModalFooterBar` components that are included
in the Videos UI directory.

```js
import VideosUi from 'calypso/components/videos-ui';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';
import { COURSE_SLUGS } from 'calypso/data/courses';

const Component = () => {
	return (
		<VideosUi
			courseSlug={ COURSE_SLUGS.BLOGGING_QUICK_START }
			HeaderBar={ ( headerProps ) => <ModalHeaderBar onClose={ onClose } { ...headerProps } /> }
			FooterBar={ ( footerProps ) => <ModalFooterBar onBackClick={ onClose } { ...footerProps } /> }
			areVideosTranslated={ false }
		/>
	);
};
```

It is helpful to notice how the `HeaderBar` and `FooterBar` props are prepared. By using
a function wrapper we can guarantee that the props sent by `VideosUi` are being passed
down to the specific header and footer in addition to the custom properties this components might take (in
this case `onClose` and `onBackClick`).

## Props

- `courseSlug` a string identifying the course metadata. This is used to fetch course information from the data endpoint.

- `HeaderBar` a component representing the top bar of the Video UI. Props received:
  - `course` the course information.
- `FooterBar` a component representing the footer of the Video UI. Props received:
  - `course` the course information.
  - `isCourseComplete` whether the course was viewed completely by the user.
- `areVideosTranslated` a boolean flag indicating whether the videos are translated from English. If they
  are not, a banner displaying this situation is shown to the user.
