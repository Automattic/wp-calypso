import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import LinkButton from '../link-button';
import PrimaryButton from '../primary-button';

import './style.scss';

type ContinueAsUserCardProps = {
	avatarUrl: string;
	name: string;
	email: string;
	continueLabel: string;
	switchAccountLabel: string;
	onContinue: () => void;
	onSwitchAccount: () => void;
};

const ContinueAsUserCard = ( {
	avatarUrl,
	name,
	email,
	continueLabel,
	switchAccountLabel,
	onContinue,
	onSwitchAccount,
}: ContinueAsUserCardProps ) => (
	<Card className="auth-continue-as-user-card">
		<CardBody>
			<VStack spacing={ 4 }>
				<HStack spacing={ 3 } justify="flex-start" alignment="center">
					<img className="auth-continue-as-user-card__avatar" src={ avatarUrl } alt="" />
					<VStack spacing={ 0 }>
						<span className="auth-continue-as-user-card__name">{ name }</span>
						<span className="auth-continue-as-user-card__email">{ email }</span>
					</VStack>
				</HStack>
				<VStack spacing={ 2 }>
					<PrimaryButton onClick={ onContinue }>{ continueLabel }</PrimaryButton>
					<LinkButton onClick={ onSwitchAccount }>{ switchAccountLabel }</LinkButton>
				</VStack>
			</VStack>
		</CardBody>
	</Card>
);

export default ContinueAsUserCard;
