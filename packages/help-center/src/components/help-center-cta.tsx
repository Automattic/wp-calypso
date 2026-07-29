/* eslint-disable wpcalypso/jsx-classname-namespace */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { calendar, external, Icon } from '@wordpress/icons';
import { useEffect } from 'react';
import './help-center-cta.scss';

export type HelpCenterCTAVariant = 'banner' | 'link-list-item';

export interface HelpCenterCTAProps {
	variant: HelpCenterCTAVariant;
	ctaId: string;
	placement: string;
	url: string;
	title: string;
	description?: string;
	actionLabel?: string;
}

export const HelpCenterCTA: React.FC< HelpCenterCTAProps > = ( {
	variant,
	ctaId,
	placement,
	url,
	title,
	description,
	actionLabel,
} ) => {
	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_cta_impression', {
			cta_id: ctaId,
			variant,
			placement,
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const trackClick = () => {
		recordTracksEvent( 'calypso_helpcenter_cta_click', {
			cta_id: ctaId,
			variant,
			placement,
		} );
	};

	if ( variant === 'link-list-item' ) {
		return (
			<li className="help-center-cta__resource-item help-center-link__item">
				<div className="help-center-link__cell">
					<a href={ url } target="_blank" rel="noreferrer" onClick={ trackClick }>
						<Icon icon={ calendar } size={ 24 } />
						<span>
							<span className="help-center-cta__resource-title">{ title }</span>
							{ description && (
								<span className="help-center-cta__resource-description">{ description }</span>
							) }
						</span>
						<Icon icon={ external } size={ 20 } />
					</a>
				</div>
			</li>
		);
	}

	return (
		<div className="help-center-cta__banner">
			<p className="help-center-cta__title">
				<strong>{ title }</strong>
			</p>
			{ description && <p className="help-center-cta__description">{ description }</p> }
			{ actionLabel && (
				<a
					className="help-center-cta__action"
					href={ url }
					target="_blank"
					rel="noreferrer"
					onClick={ trackClick }
				>
					{ actionLabel }
				</a>
			) }
		</div>
	);
};
