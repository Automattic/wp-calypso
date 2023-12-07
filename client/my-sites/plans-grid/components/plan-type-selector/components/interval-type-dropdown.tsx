import styled from '@emotion/styled';
import { CustomSelectControl } from '@wordpress/components';
import { IntervalTypeProps } from '../types';
import generatePath from '../utils';

const AddOnOption = styled.a`
	.discount {
		color: var( --studio-green-40 );
		display: inline-block;
		font-size: 0.7rem;
	}
	.name {
		margin-right: 4px;
	}
`;

const StyledCustomSelectControl = styled( CustomSelectControl )`
	&,
	&:visited,
	&:hover .name {
		color: var( --color-text );
	}
	.components-custom-select-control__button {
		min-width: 195px;
	}
	.components-custom-select-control__menu {
		margin: 0;
	}
`;

const optionsMap: Record<
	string,
	{ key: string; name: string; discountText: string; url: string; termInMonths: number }
> = {
	yearly: { key: 'yearly', name: 'Pay yearly', discountText: '55% off', url: '', termInMonths: 12 },
	'2yearly': {
		key: '2yearly',
		name: 'Pay every 2 years',
		discountText: '63% off',
		url: '',
		termInMonths: 24,
	},
	'3yearly': {
		key: '3yearly',
		name: 'Pay every 3 years',
		discountText: '69% off',
		url: '',
		termInMonths: 36,
	},
	monthly: { key: 'monthly', name: 'Pay monthly', discountText: '', url: '', termInMonths: 1 },
};
const optionsList = Object.values( optionsMap );

export const IntervalTypeDropdown: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const { intervalType } = props;
	const additionalPathProps = {
		...( props.redirectTo ? { redirect_to: props.redirectTo } : {} ),
		...( props.selectedPlan ? { plan: props.selectedPlan } : {} ),
		...( props.selectedFeature ? { feature: props.selectedFeature } : {} ),
	};

	const isDomainUpsellFlow = new URLSearchParams( window.location.search ).get( 'domain' );

	const isDomainAndPlanPackageFlow = new URLSearchParams( window.location.search ).get(
		'domainAndPlanPackage'
	);

	const isJetpackAppFlow = new URLSearchParams( window.location.search ).get( 'jetpackAppPlans' );
	const selectOptonsList = optionsList.map( ( option ) => ( {
		key: option.key,
		name: (
			<AddOnOption
				href={ generatePath( props, {
					intervalType: option.key,
					domain: isDomainUpsellFlow,
					domainAndPlanPackage: isDomainAndPlanPackageFlow,
					jetpackAppPlans: isJetpackAppFlow,
					...additionalPathProps,
				} ) }
			>
				<span className="name"> { option.name } </span>
				<span className="discount"> { option.discountText } </span>
			</AddOnOption>
		),
	} ) );
	return (
		<StyledCustomSelectControl
			label=""
			options={ selectOptonsList }
			value={ optionsMap[ intervalType ] }
		/>
	);
};
