import { createInterpolateElement } from '@wordpress/element';
import { TopBar, BackButton, PrimaryButton, StickyBottomBar, LinkButton } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { FixedColumnOnTheLeftLayout } from './FixedColumnOnTheLeftLayout';
import type { Meta } from '@storybook/react';

const meta: Meta< typeof FixedColumnOnTheLeftLayout > = {
	title: 'Onboarding/StepWireframes/FixedColumnOnTheLeftLayout',
	component: FixedColumnOnTheLeftLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const ThreeColumnsOnTheLeft = () => (
	<FixedColumnOnTheLeftLayout
		fixedColumnWidth={ 3 }
		topBar={
			<TopBar
				leftElement={ <BackButton /> }
				rightElement={
					<span>
						Need help? <LinkButton>Contact us</LinkButton>
					</span>
				}
			/>
		}
		heading={
			<FixedColumnOnTheLeftLayout.Heading
				text="Fixed Column on the Left"
				subText={ createInterpolateElement(
					'An example of the <code>FixedColumnOnTheLeftLayout</code> wireframe layout.',
					{
						code: <code />,
					}
				) }
			/>
		}
		stickyBottomBar={ ( context ) => {
			if ( context.isLargeViewport ) {
				return null;
			}

			return <StickyBottomBar rightElement={ <PrimaryButton /> } />;
		} }
	>
		<WireframePlaceholder style={ { flex: 1 } }>Sidebar</WireframePlaceholder>
		<WireframePlaceholder height="100%">Main</WireframePlaceholder>
	</FixedColumnOnTheLeftLayout>
);
