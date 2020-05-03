/**
 * External Dependencies
 */
import React from 'react';
import { get } from 'lodash';

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
	icon,
	tracks,
	trackImpression,
	onClick,
	onDismiss,
} ) {
	const isJetpack = icon && icon.indexOf( 'jetpack' ) !== -1;

	return (
		<>
			{ trackImpression && trackImpression() }
			<Banner
				callToAction={ CTA.message }
				title={ message }
				description={ description }
				disableHref
				dismissPreferenceName={ featureClass }
				dismissTemporary={ true }
				onDismiss={ onDismiss }
				onClick={ onClick }
				event={ get( tracks, [ 'click', 'name' ] ) || `jitm_nudge_click_${ id }` }
				href={ CTA.link }
				jetpack={ isJetpack }
				horizontal={ isJetpack }
				target={ '_blank' }
			/>
		</>
	);
}
