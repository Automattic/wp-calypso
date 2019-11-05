/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';

export default function DefaultTemplate( {
	id,
	CTA,
	message,
	description,
	featureClass,
	currentSite,
	onClick,
	onDismiss,
} ) {
	return (
		<Banner
			callToAction={ CTA.message }
			title={ message }
			description={ description }
			disableHref
			dismissPreferenceName={ featureClass + '123' }
			dismissTemporary={ true }
			onDismiss={ onDismiss }
			onClick={ onClick }
			event={ `jitm_nudge_click_${ id }` }
			href={ `https://jetpack.com/redirect/?source=jitm-${ id }&site=${ currentSite.domain }` }
			target={ '_blank' }
		/>
	);
}
