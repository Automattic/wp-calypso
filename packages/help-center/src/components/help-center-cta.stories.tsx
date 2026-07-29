/* eslint-disable wpcalypso/jsx-classname-namespace */
import { localizeUrl } from '@automattic/i18n-utils';
import { Meta, StoryObj } from '@storybook/react';
import { close, external, lineSolid, page, video, Icon } from '@wordpress/icons';
import { HelpCenterCTA } from './help-center-cta';
import type { ComponentProps, ReactNode } from 'react';
import './help-center-header.scss';
import './help-center-search.scss';
import './help-center-more-resources.scss';
import './help-center-cta.stories.scss';

const meta: Meta< typeof HelpCenterCTA > = {
	title: 'packages/help-center/HelpCenterCTA',
	component: HelpCenterCTA,
	tags: [ 'autodocs' ],
};

export default meta;

type Story = StoryObj< typeof HelpCenterCTA >;

const sampleArgs = {
	ctaId: 'onboarding-call-v1',
	placement: 'help-center-home',
	url: 'https://calendly.example.com/onboarding',
	title: 'Get set up with a free onboarding call',
	description: 'Talk one-on-one with a Happiness Engineer and get your new site off the ground.',
};

const StaticResourceRow = ( {
	icon,
	label,
	href,
}: {
	icon: ComponentProps< typeof Icon >[ 'icon' ];
	label: string;
	href: string;
} ) => (
	<li className="help-center-more-resources__resource-item help-center-link__item">
		<div className="help-center-more-resources__resource-cell help-center-link__cell">
			<a href={ href } target="_blank" rel="noreferrer">
				<Icon icon={ icon } size={ 24 } />
				<span>{ label }</span>
				<Icon icon={ external } size={ 20 } />
			</a>
		</div>
	</li>
);

const PanelChrome = ( {
	children,
	moreResourcesLeadItem,
}: {
	children?: ReactNode;
	moreResourcesLeadItem?: ReactNode;
} ) => (
	<div className="help-center help-center-cta-stories">
		<div className="help-center__container help-center-cta-stories__panel">
			<div className="help-center__container-header">
				<span className="help-center-header__text">Help Center</span>
				<span className="help-center-cta-stories__header-actions">
					<Icon icon={ lineSolid } size={ 20 } />
					<Icon icon={ close } size={ 20 } />
				</span>
			</div>
			<div className="help-center__container-content">
				<div className="inline-help__search">
					{ children }
					<div className="help-center-cta-stories__search">
						<span>Search guides…</span>
					</div>
					<div className="help-center-more-resources">
						<h3 className="help-center__section-title">More resources</h3>
						<ul>
							{ moreResourcesLeadItem }
							<StaticResourceRow
								icon={ page }
								label="Support guides"
								href={ localizeUrl( 'https://wordpress.com/support/' ) }
							/>
							<StaticResourceRow
								icon={ video }
								label="Courses"
								href={ localizeUrl( 'https://wordpress.com/support/courses' ) }
							/>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</div>
);

export const Banner: Story = {
	args: {
		...sampleArgs,
		variant: 'banner',
		actionLabel: 'Book your free call',
	},
	render: ( args ) => (
		<PanelChrome>
			<HelpCenterCTA { ...args } />
		</PanelChrome>
	),
};

export const BannerWithoutAction: Story = {
	args: {
		...sampleArgs,
		variant: 'banner',
	},
	render: ( args ) => (
		<PanelChrome>
			<HelpCenterCTA { ...args } />
		</PanelChrome>
	),
};

export const LinkListItem: Story = {
	args: {
		...sampleArgs,
		variant: 'link-list-item',
	},
	render: ( args ) => <PanelChrome moreResourcesLeadItem={ <HelpCenterCTA { ...args } /> } />,
};
