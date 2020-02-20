/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'components/gridicon';

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
	id,
	dismissPreferenceName,
	onClick,
	onDismissClick,
	trackImpression,
	tracks,
	tracksDismissName,
	tracksDismissProperties,
} ) {
	if ( abtest( 'sidebarUpsellNudgeUnification' ) === 'variantShowUnifiedUpsells' ) {
		const clickName = tracks?.click?.name ?? `jitm_nudge_click_${ id }`;
		const clickProps = tracks?.click?.props;
		const displayName = tracks?.display?.name ?? `jitm_nudge_impression_${ id }`;
		const displayProps = tracks?.display?.props;
		const jitmProps = { id: id, jitm: true };

		return (
			<UpsellNudge
				callToAction={ CTA.message }
				compact
				event={ displayName }
				dismissPreferenceName={ dismissPreferenceName }
				href={ CTA.link }
				onDismissClick={ onDismissClick }
				title={ message }
				tracksClickName={ clickName }
				tracksClickProperties={ { ...jitmProps, ...clickProps } }
				tracksImpressionName={ displayName }
				tracksImpressionProperties={ { ...jitmProps, ...displayProps } }
				tracksDismissName={ tracksDismissName }
				tracksDismissProperties={ { ...jitmProps, ...tracksDismissProperties } }
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
