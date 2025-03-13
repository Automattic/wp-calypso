import { Button } from '@wordpress/components';
import { withStepContainerV2ContextDecorator } from '../../step-container-v2/index.stories';
import { HorizontalStepLayout } from './HorizontalStepLayout';
import type { Meta } from '@storybook/react';

import './style.stories.scss';

const meta: Meta< typeof HorizontalStepLayout > = {
	title: 'Onboarding/StepWireframes/HorizontalStepLayout',
	component: HorizontalStepLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const SiteIntent = () => {
	return (
		<HorizontalStepLayout
			verticalAlign="center"
			heading={ {
				text: 'Where will you start?',
				subText: 'You can change your mind at any time.',
				imageUrl: 'https://wordpress.com/calypso/images/intent-a2607af75a18df1a01b2.svg',
			} }
			rightContent={ () => {
				return (
					<div style={ { display: 'flex', flexDirection: 'column', gap: '1rem' } }>
						<Button variant="secondary">Start writing</Button>
						<Button variant="secondary">Start building</Button>
					</div>
				);
			} }
		/>
	);
};

export const DIFM = () => {
	return (
		<HorizontalStepLayout
			heading={ {
				text: 'Let us build your site in 4 days for R$1,775*',
				subText:
					'*One time fee, plus an additional purchase of the Premium plan. A WordPress.com professional will create layouts for up to 5 pages of your site. It only takes 4 simple steps:',
			} }
			nextButton={ {
				label: 'Continue',
				onClick: () => {},
			} }
			leftContent={ ( { nextButton } ) => (
				<div>
					<ul>
						<li>Step 1</li>
						<li>Step 2</li>
						<li>Step 3</li>
					</ul>
					<p>Share your finished site with the world in 4 business days or less!</p>
					{ nextButton }
				</div>
			) }
			rightContent={ ( { isSmallScreen } ) => ( isSmallScreen ? null : <div>DIFM Image</div> ) }
		/>
	);
};
