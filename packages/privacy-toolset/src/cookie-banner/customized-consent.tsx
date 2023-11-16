import { useState } from 'react';
import { defaultBuckets } from './consts';
import { GranularConsent } from './granular-consent';
import type { Buckets, CustomizedConsentContent } from './types';

type Props = {
	content: CustomizedConsentContent;
	onAccept: ( buckets: Buckets ) => void;
};

export const CustomizedConsent = ( { content, onAccept }: Props ) => {
	const [ buckets, setBuckets ] = useState( defaultBuckets );
	const handleChangeBucket = ( bucket: keyof Buckets ) => ( checked: boolean ) => {
		setBuckets( ( prevBuckets ) => ( {
			...prevBuckets,
			[ bucket ]: checked,
		} ) );
	};
	const handleAccept = () => {
		onAccept( buckets );
	};

	return (
		<div className="cookie-banner__options-selection">
			<p className="cookie-banner__options-lead-text">{ content.description }</p>
			<GranularConsent
				name="essential"
				content={ content.categories.essential }
				onChange={ handleChangeBucket( 'essential' ) }
				checked={ buckets.essential }
				disabled
			/>
			<GranularConsent
				name="analytics"
				content={ content.categories.analytics }
				onChange={ handleChangeBucket( 'analytics' ) }
				checked={ buckets.analytics }
			/>
			<GranularConsent
				name="advertising"
				content={ content.categories.advertising }
				onChange={ handleChangeBucket( 'advertising' ) }
				checked={ buckets.advertising }
			/>
			<button className="cookie-banner__accept-selection-button" onClick={ handleAccept }>
				{ content.acceptSelectionButton }
			</button>
		</div>
	);
};
