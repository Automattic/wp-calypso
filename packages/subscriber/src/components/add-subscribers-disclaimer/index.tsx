import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { FunctionComponent } from 'react';

interface Props {
	buttonLabel: string;
}

const AddSubscribersLearnMore: FunctionComponent< Props > = ( { buttonLabel } ) => {
	const { __ } = useI18n();

	return (
		<p className="add-subscriber__form--disclaimer">
			{ sprintf(
				/* translators: %s is the CTA button name */
				__(
					'By clicking "%s," you represent that you\'ve obtained the appropriate consent to email each person.'
				),
				buttonLabel
			) }
		</p>
	);
};

export default AddSubscribersLearnMore;
