import { Button } from '@automattic/components';
import ActionCard from 'calypso/components/action-card';
import type { CardProps, GenericActionCardProps } from './types';

import './style.scss';

const DomainInfoCard = ( props: GenericActionCardProps ) => {
	const { title, description, type, buttonDisabled } = props;
	const cardProps: CardProps = {
		headerText: title,
		mainText: description,
		classNames: 'domain-info-card',
	};

	switch ( type ) {
		case 'href':
			return (
				<ActionCard { ...cardProps }>
					<Button
						compact
						primary={ props.isPrimary }
						href={ ! buttonDisabled ? props.href : undefined }
						disabled={ buttonDisabled }
					>
						{ props.ctaText }
					</Button>
				</ActionCard>
			);

		case 'click':
			return (
				<ActionCard { ...cardProps }>
					<Button
						compact
						primary={ props.isPrimary }
						onClick={ props.onClick }
						disabled={ buttonDisabled }
					>
						{ props.ctaText }
					</Button>
				</ActionCard>
			);

		case 'custom':
			return <ActionCard { ...cardProps }>{ props.cta }</ActionCard>;

		default:
			return <ActionCard { ...cardProps } />;
	}
};

export default DomainInfoCard;
