import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import {
	DialogContainer,
	DomainPlanDialogProps,
	Heading,
	StyledButton,
	SubHeading,
} from '../free-plan-paid-domain-dialog';

export const List = styled.ul`
	list-style: none;
	margin: 20px 0 20px;
`;
export const ListItem = styled.li`
	display: flex;
	& div:first-of-type {
		margin: 0 10px 0 10px;
	}
`;

export function DialogFreeDomainFreePlan( {
	freeSubdomain,
	onPlanSelected,
	onFreePlanSelected,
}: { freeSubdomain: string } & Omit< DomainPlanDialogProps, 'paidDomainName' > ) {
	const translate = useTranslate();

	return (
		<DialogContainer>
			<Heading>{ translate( "Don't miss out" ) }</Heading>
			<SubHeading>
				{ translate( 'With a Free plan, you miss out on a lot of great features:' ) }
			</SubHeading>
			<List>
				<ListItem>
					<div>
						<Gridicon icon="cross" size={ 24 } />
					</div>
					<div>No free custom domain: Your site will be shown to visitors as { freeSubdomain }</div>
				</ListItem>
				<ListItem>
					<div>
						<Gridicon icon="cross" size={ 24 } />
					</div>
					<div>
						{ translate(
							'No ad-free experience: Your visitors will see external ads on your site.'
						) }
					</div>
				</ListItem>
				<ListItem>
					<div>
						<Gridicon icon="cross" size={ 24 } />
					</div>
					<div>
						{ translate( 'No unlimited professional customer support (only community forums)' ) }
					</div>
				</ListItem>
				<ListItem>
					<div>
						<Gridicon icon="cross" size={ 24 } />
					</div>
					<div>
						{ translate(
							'No extra storage. You only get 1GB for photos, videos, media, and documents.'
						) }
					</div>
				</ListItem>

				<div>
					{ translate(
						'Unlock these features with a Personal plan for $4/month. Risk-free with our 14-day money back guarantee.'
					) }
				</div>
				<div>
					<StyledButton onClick={ onFreePlanSelected }>
						{ translate( 'Continue with Free plan' ) }
					</StyledButton>
					<StyledButton primary onClick={ onPlanSelected }>
						{ translate( 'Get the Personal plan' ) }
					</StyledButton>
				</div>
				<div>Personal plan: $4 per month, $48 billed annually. Excluding taxes.</div>
			</List>
		</DialogContainer>
	);
}
