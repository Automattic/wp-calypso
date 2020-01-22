/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';
import { abtest } from 'lib/abtest';

/**
 * Style dependencies
 */
import './sidebar-banner.scss';

export default function SidebarBannerTemplate( {
	icon,
	CTA,
	message,
	onClick,
	trackImpression,
	id,
	event,
	featureClass,
	tracks,
	...props
} ) {
	if ( abtest( 'sidebarUpsellNudgeUnification' ) === 'variantShowUnifiedUpsells' ) {
		const clickName = get( tracks, [ 'click', 'name' ] ) || `jitm_nudge_click_${ id }`;
		const clickProps = get( tracks, [ 'click', 'props' ] );
		const displayName = get( tracks, [ 'display', 'name' ] ) || `jitm_nudge_impression_${ id }`;
		const displayProps = get( tracks, [ 'display', 'props' ] );
		const jitmProps = { id: id, jitm: true };

		return (
			<UpsellNudge
				callToAction={ CTA.message }
				compact
				event={ displayName }
				href={ CTA.link }
				onClick={ onClick }
				title={ message }
				tracksClickName={ clickName }
				tracksClickProperties={ { ...jitmProps, ...clickProps } }
				tracksImpressionName={ displayName }
				tracksImpressionProperties={ { ...jitmProps, ...displayProps } }
				{ ...props }
			/>
		);
	}

	return (
		<div className="sidebar-banner">
			{ trackImpression && trackImpression() }
			<a className="sidebar-banner__link" onClick={ onClick } href={ CTA.link }>
				<span className="sidebar-banner__icon-wrapper">
					<Gridicon className="sidebar-banner__icon" icon={ icon || 'info-outline' } size={ 18 } />
				</span>
				<span className="sidebar-banner__content">
					<span className="sidebar-banner__text">{ message }</span>
				</span>
				<span className="sidebar-banner__cta">{ CTA.message }</span>
			</a>
		</div>
	);
}
