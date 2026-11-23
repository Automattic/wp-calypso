import { SiteThumbnail } from '@automattic/components';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { SITE_PREVIEW_MSHOT } from '../../steps-repository/components/site-preview/mshot';
import type { ReactNode } from 'react';

import './style.scss';

/**
 * The blue panel beside a step's text, holding one or more site windows.
 */
export const SitePreviewPanel = ( {
	className,
	children,
}: {
	className?: string;
	children: ReactNode;
} ) => (
	<div className={ clsx( 'site-preview-panel', className ) }>
		<div className="site-preview-panel__content">{ children }</div>
	</div>
);

const skeleton = (
	<span className="site-window__skeleton" aria-hidden="true">
		<span />
		<span />
		<span />
		<span />
		<span />
	</span>
);

/**
 * A browser window showing a site's screenshot, with a pulsing stand-in page until it arrives. A
 * site we know can't be loaded keeps the stand-in, still, and says so instead.
 */
export const SiteWindow = ( {
	url,
	address,
	isUnavailable = false,
}: {
	url: string;
	/** Shown in the address bar. */
	address: string;
	isUnavailable?: boolean;
} ) => (
	<figure className="site-window">
		<div className="site-window__bar" aria-hidden="true">
			<span className="site-window__dots" />
			<span className="site-window__address">{ address }</span>
		</div>
		{ isUnavailable ? (
			<div className="site-window__screenshot site-window__screenshot--unavailable">
				{ skeleton }
				<span className="site-window__note">{ __( 'Preview unavailable' ) }</span>
			</div>
		) : (
			<SiteThumbnail
				mShotsUrl={ url }
				className="site-window__screenshot"
				alt={ sprintf(
					/* translators: %s: the address of a site, e.g. example.com. */
					__( 'Preview of %s' ),
					address
				) }
				mshotsOption={ SITE_PREVIEW_MSHOT }
				width={ SITE_PREVIEW_MSHOT.w }
				height={ SITE_PREVIEW_MSHOT.h }
			>
				{ skeleton }
			</SiteThumbnail>
		) }
	</figure>
);
