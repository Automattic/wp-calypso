import { translationExists } from '@automattic/i18n-utils';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { FunctionComponent } from 'react';

interface Props {
	buttonLabel: string;
}

const AddSubscribersLearnMore: FunctionComponent< Props > = ( { buttonLabel } ) => {
	const { __ } = useI18n();

	const text = translationExists(
		'By clicking "%s," you represent that you\'ve obtained the appropriate consent to email each person. Spam complaints or high bounce rate from your subscribers may lead to action against your account.'
	)
		? /* translators: %s is the CTA button name */
		  __(
				'By clicking "%s," you represent that you\'ve obtained the appropriate consent to email each person. Spam complaints or high bounce rate from your subscribers may lead to action against your account.'
		  )
		: /* translators: %s is the CTA button name */
		  __(
				'By clicking "%s," you represent that you\'ve obtained the appropriate consent to email each person.'
		  );

	return <p className="add-subscriber__form--disclaimer">{ sprintf( text, buttonLabel ) }</p>;
};

export default AddSubscribersLearnMore;
