import { Badge } from '@automattic/components';
import { Button } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { Heading, StickyBottomBar, TopBar, BackButton, PrimaryButton } from '../..';
import { WireframePlaceholder } from '../../helpers/wireframe-placeholder';
import { withStepContainerV2ContextDecorator } from '../../helpers/withStepContainerV2ContextDecorator';
import { FullWidthLayout } from './FullWidthLayout';
import type { Meta } from '@storybook/react';

import './style.stories.scss';

const meta: Meta< typeof FullWidthLayout > = {
	title: 'Onboarding/StepWireframes/FullWidthLayout',
	component: FullWidthLayout,
	decorators: [ withStepContainerV2ContextDecorator ],
};

export default meta;

export const ThemePreview = () => {
	const backButton = <BackButton label="Back" />;

	return (
		<FullWidthLayout className="theme-preview" topBar={ <TopBar leftElement={ backButton } /> }>
			<div className="theme-preview__info">
				<div className="theme-preview__description">
					<Badge>Free</Badge>
					<Heading
						size="small"
						text="Dropp"
						align="left"
						subText="Dropp is a blogging theme that appeals to the sneakerhead. Its urban styles with bold typography and vibrant accent color make it ideal to the streetwear enthusiasts looking to express themselves."
					/>
				</div>
			</div>
			<WireframePlaceholder className="theme-preview__preview">Preview</WireframePlaceholder>
		</FullWidthLayout>
	);
};

const FontsBar = () => {
	return (
		<div style={ { padding: 16, height: '106px', borderBottom: '1px solid gray' } }>Fonts</div>
	);
};

export const ThemePreviewFonts = () => {
	const backButton = <BackButton>Back</BackButton>;
	const nextButton = <PrimaryButton>Save fonts</PrimaryButton>;

	return (
		<FullWidthLayout
			className="theme-preview"
			topBar={ ( { isLargeViewport } ) =>
				isLargeViewport ? <TopBar leftElement={ backButton } /> : <FontsBar />
			}
			stickyBottomBar={ ( { isLargeViewport } ) => {
				if ( isLargeViewport ) {
					return null;
				}

				return <StickyBottomBar leftElement={ backButton } rightElement={ nextButton } />;
			} }
		>
			{ ( { isLargeViewport } ) => {
				return (
					<>
						{ isLargeViewport && (
							<div className="theme-preview__info">
								<div className="theme-preview__description">
									<Heading
										size="small"
										text={
											<div className="theme-preview__fonts">
												<Button icon={ chevronLeft } /> Fonts
											</div>
										}
										align="left"
										subText="Elevate your design with expertly curated font pairings."
									/>
								</div>
								{ nextButton }
							</div>
						) }
						<WireframePlaceholder className="theme-preview__preview">Preview</WireframePlaceholder>
					</>
				);
			} }
		</FullWidthLayout>
	);
};
