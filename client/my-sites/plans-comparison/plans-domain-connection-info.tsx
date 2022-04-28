import { TYPE_FREE, TYPE_FLEXIBLE } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { SCREEN_BREAKPOINT_SIGNUP } from './constant';
import type { WPComPlan } from '@automattic/calypso-products';

const P = styled.p`
	display: flex;
	font-size: 0.9em;

	.info-popover {
		display: none;
	}

	@media screen and ( min-width: ${ SCREEN_BREAKPOINT_SIGNUP + 1 }px ) {
		height: 21px;

		.info-popover {
			display: initial;
		}
	}
`;

const Span = styled.span`
	margin-left: 0;

	@media screen and ( min-width: ${ SCREEN_BREAKPOINT_SIGNUP + 1 }px ) {
		margin-left: 4px;
	}
`;

interface Props {
	plan: WPComPlan;
}

export const PlansDomainConnectionInfo: React.FunctionComponent< Props > = ( { plan } ) => {
	const translate = useTranslate();

	if ( [ TYPE_FREE, TYPE_FLEXIBLE ].includes( plan.type ) ) {
		return <P />;
	}

	return (
		<P>
			<InfoPopover position="top" iconSize={ 18 } showOnHover={ true }>
				{ translate( 'Only paid annual subscriptions allow you to connect domains.' ) }
			</InfoPopover>
			<Span>{ translate( 'Connecting a domain requires a Pro plan' ) }</Span>
		</P>
	);
};
