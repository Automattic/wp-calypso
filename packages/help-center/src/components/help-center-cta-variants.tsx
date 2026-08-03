/* eslint-disable wpcalypso/jsx-classname-namespace */
import { calendar, external, Icon } from '@wordpress/icons';
import type { ReactNode } from 'react';

/**
 * What every variant gets to render. Campaign copy and destination come from the
 * payload; `onClick` is the tracking handler the dispatcher hands down.
 */
export interface HelpCenterCTAVariantProps {
	url: string;
	title: string;
	description?: string;
	actionLabel?: string;
	onClick: () => void;
}

const CTALink = ( {
	url,
	onClick,
	className,
	children,
}: {
	url: string;
	onClick: () => void;
	className?: string;
	children: ReactNode;
} ) => (
	<a className={ className } href={ url } target="_blank" rel="noreferrer" onClick={ onClick }>
		{ children }
	</a>
);

/** Title-only campaigns make the whole banner the click target. */
const BannerLink = ( { url, title, description, onClick }: HelpCenterCTAVariantProps ) => (
	<CTALink
		className="help-center-cta__banner help-center-cta__banner--link"
		url={ url }
		onClick={ onClick }
	>
		<span className="help-center-cta__banner-content">
			<span className="help-center-cta__title">
				<strong>{ title }</strong>
			</span>
			{ description && <span className="help-center-cta__description">{ description }</span> }
		</span>
		<Icon icon={ external } size={ 20 } />
	</CTALink>
);

const BannerWithAction = ( {
	url,
	title,
	description,
	actionLabel,
	onClick,
}: HelpCenterCTAVariantProps ) => (
	<div className="help-center-cta__banner">
		<p className="help-center-cta__title">
			<strong>{ title }</strong>
		</p>
		{ description && <p className="help-center-cta__description">{ description }</p> }
		<CTALink className="help-center-cta__action" url={ url } onClick={ onClick }>
			{ actionLabel }
		</CTALink>
	</div>
);

export const Banner = ( props: HelpCenterCTAVariantProps ) =>
	props.actionLabel ? <BannerWithAction { ...props } /> : <BannerLink { ...props } />;

export const LinkListItem = ( { url, title, description, onClick }: HelpCenterCTAVariantProps ) => (
	<li className="help-center-cta__resource-item help-center-link__item">
		<div className="help-center-link__cell">
			<CTALink url={ url } onClick={ onClick }>
				<Icon icon={ calendar } size={ 24 } />
				<span>
					<span className="help-center-cta__resource-title">{ title }</span>
					{ description && (
						<span className="help-center-cta__resource-description">{ description }</span>
					) }
				</span>
				<Icon icon={ external } size={ 20 } />
			</CTALink>
		</div>
	</li>
);
