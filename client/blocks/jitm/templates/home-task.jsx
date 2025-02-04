import { recordTracksEvent } from '@automattic/calypso-analytics';
import DOMPurify from 'dompurify';
import React from 'react';
import TwentyPercentImageCoupon from 'calypso/assets/images/customer-home/notice-home-limited-time-coupon-20-percent.svg';
import ThirtyPercentImageCoupon from 'calypso/assets/images/customer-home/notice-home-limited-time-coupon-30-percent.svg';
import { NOTICE_HOME_LIMITED_TIME_OFFER_COUPON } from 'calypso/my-sites/customer-home/cards/constants';
import Task from 'calypso/my-sites/customer-home/cards/tasks/task';

// Sanitize HTML content to allow only <b> tags and escape other tags.
const sanitizeHTMLWithBTags = ( html ) => {
	// Getting an instance of DOMPurify this way is needed to fix a related JEST test.
	return DOMPurify.sanitize( html, {
		ALLOWED_TAGS: [ 'b' ],
	} );
};

export default function HomeTaskTemplate( { id, CTA, tracks, ...props } ) {
	const jitmProps = { id, cta_name: id, jitm: true };
	const tracksClickProperties = { ...jitmProps, ...tracks?.click?.props };

	const illustration =
		props.featureClass === 'limited_time_30_off_home_card'
			? ThirtyPercentImageCoupon
			: TwentyPercentImageCoupon;

	const handleClick = () => {
		if ( id ) {
			recordTracksEvent?.( 'calypso_home_task_cta_click', {
				cta_name: id,
				...tracksClickProperties,
			} );
		}
	};

	return (
		<Task
			title={ props.message }
			description={
				<>
					<span
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ { __html: sanitizeHTMLWithBTags( props.description ) } }
					/>
				</>
			}
			actionText={ CTA.message }
			actionUrl={ CTA.link }
			actionOnClick={ handleClick }
			illustration={ illustration }
			customClass="notice-offer-coupon"
			taskId={ NOTICE_HOME_LIMITED_TIME_OFFER_COUPON }
		/>
	);
}
