import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCheckoutHelpCenter } from 'calypso/my-sites/checkout/src/hooks/use-checkout-help-center';

const ContactContainer = styled.div`
	display: flex;
	align-items: center;
	column-gap: 8px;
	font-size: 14px;
	line-height: 20px;
	font-weight: 500;
	label {
		color: var( --studio-gray-60 );
	}
	button.thank-you-help-center {
		text-decoration: underline;
		line-height: 20px;
		font-size: 14px;

		span {
			color: var( --studio-wordpress-blue );
		}

		&:hover {
			text-decoration: none;
		}
	}
	.gridicon {
		display: block;
		fill: var( --studio-gray-60 );
	}
	label,
	span {
		display: none;
	}

	@media ( min-width: 600px ) {
		.gridicon {
			display: none;
		}
		label,
		span {
			display: block;
		}
	}
`;

export function DefaultMasterbarContact() {
	const translate = useTranslate();
	const { helpCenterButtonCopy, helpCenterButtonLink, toggleHelpCenter } = useCheckoutHelpCenter();

	return (
		<ContactContainer>
			<label>{ helpCenterButtonCopy ?? translate( 'Need extra help?' ) }</label>
			<Button className="thank-you-help-center" variant="link" onClick={ toggleHelpCenter }>
				<Gridicon icon="help-outline" />
				<span>{ helpCenterButtonLink ?? translate( 'Visit Help Center' ) }</span>
			</Button>
		</ContactContainer>
	);
}
