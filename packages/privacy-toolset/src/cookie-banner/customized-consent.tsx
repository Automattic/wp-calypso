import { useState } from 'react';
import { GranularConsent } from './granular-consent';
import { Buckets, CustomizedConsentContent } from './types';

type Props = {
	content: CustomizedConsentContent;
	onAccept: ( buckets: Buckets ) => void;
};

const allBucketsTrue: Buckets = {
	essential: true,
	analytics: true,
	advertising: true,
};

export const CustomizedConsent = ( { content, onAccept }: Props ) => {
	const [ buckets, setBuckets ] = useState( allBucketsTrue );
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
				content={ content.categories.essential }
				onChange={ handleChangeBucket( 'essential' ) }
				checked={ buckets.essential }
				disabled
			/>
			<GranularConsent
				content={ content.categories.analytics }
				onChange={ handleChangeBucket( 'analytics' ) }
				checked={ buckets.analytics }
			/>
			<GranularConsent
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
