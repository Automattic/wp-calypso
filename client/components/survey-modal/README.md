# SurveyModal

Simple modal component that links to a survey.

## Example Usage

```js
import { useState } from 'react';
import ReactDOM from 'react-dom';
import surveyImage from 'calypso/assets/images/illustrations/illustration-seller.svg';
import SurveyModal from 'calypso/components/survey-modal';

function MyComponent() {
	const [ isModalVisible, setIsModalVisible ] = useState( false );

	return <>
		<div>Content</div>
		{ isModalVisible &&
		ReactDOM.createPortal(
			<SurveyModal
				name="sso-disable"
				url="https://wordpressdotcom.survey.fm/sso-disable-survey?initiated-from=calypso"
				heading={ translate( 'SSO Survey' ) }
				title={ translate( 'Hi there!' ) }
				description={ translate(
					`Spare a moment? We'd love to hear why you want to disable SSO in a quick survey.`
				) }
				surveyImage={ surveyImage }
				dismissText={ translate( 'Remind later' ) }
				confirmText={ translate( 'Take survey' ) }
			/>,
			document.body
		) };
		</>
}
```

## Props

- `name` - (string) The name to use for cookie management. Recommended to use Kebap case.
- `className` - (string) Additional className for the modal.
- `url` - (string) The url to which the confirm button links to.
- `heading` - _optional_ (string) Heading of the modal
- `title` - _optional_ (string) Title text
- `surveyImage` - _optional_ (string) Image to display in the modal
- `description` - (string) Description text
- `dismissText` - (string) Text for the dismiss button
- `confirmText` - (string) Text for the confirm button
- `showOverlay` - _optional_ (bool) A boolean that determines if the backdrop overlay is shown. 
