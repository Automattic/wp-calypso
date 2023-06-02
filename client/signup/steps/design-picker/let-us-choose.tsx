import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Design } from '@automattic/design-picker';

interface Props {
	flowName: string;
	designs: Design[];
	onSelect: ( design: Design ) => void;
}

const LetUsChooseContainer = styled.div`
	color: var( --color-neutral-70 );
	font-size: 14px;
	margin-bottom: 40px;

	@media ( min-width: 600px ) {
		margin-top: 40px;
	}
`;

const LetUsChooseButton = styled( Button )`
	border-radius: 4px;
	height: 40px;
	font-weight: 500;
	margin-top: 20px;
	text-align: center;
`;

const LetUsChoose = ( { flowName, designs, onSelect }: Props ) => {
	const translate = useTranslate();
	const LET_US_CHOOSE_THEME_SLUG = flowName === 'do-it-for-me-store' ? 'tazza' : 'russell';

	const defaultDesign = designs.find( ( design ) => LET_US_CHOOSE_THEME_SLUG === design.slug );

	if ( ! defaultDesign ) {
		return null;
	}

	function onClick() {
		recordTracksEvent( 'calypso_signup_let_us_choose_click', {
			flow: flowName,
		} );
		// @ts-expect-error: TS complains that defaultDesign could
		// be undefined. But we already return early if it is so.
		onSelect( defaultDesign, {
			isLetUsChooseSelected: true,
		} );
	}

	return (
		<LetUsChooseContainer>
			<div>
				{ translate(
					"Can't decide? No problem, our experts can choose the perfect design for your site!"
				) }
			</div>
			<LetUsChooseButton isSecondary onClick={ onClick }>
				{ translate( 'Let us choose' ) }
			</LetUsChooseButton>
		</LetUsChooseContainer>
	);
};

export default LetUsChoose;
