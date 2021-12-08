import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import ExistingSiteImage from '../site-or-domain/existing-site-image';
import NewSiteImage from '../site-or-domain/new-site-image';
import NewOrExistingSiteChoice from './new-or-existing-site-choice';
import { NewOrExistingSiteChoiceType, ChoiceType } from './types';

interface Props {
	onSelect: ( value: ChoiceType ) => void;
}

const ChoicesContainer = styled.div`
	display: flex;
	flex-flow: row wrap;
`;

export default function NewOrExistingSiteScreen( props: Props ): React.ReactElement {
	const translate = useTranslate();
	const productsList = useSelector( getAvailableProductsList );
	const productsLoaded = ! isEmpty( productsList );
	const choices: NewOrExistingSiteChoiceType[] = [
		{
			type: 'new-site',
			label: translate( 'New site' ),
			image: <NewSiteImage />,
			description: translate(
				'Start afresh. We will build your site from scratch. A free domain for one year is included.'
			),
		},
		{
			type: 'existing-site',
			label: translate( 'Existing WordPress.com site' ),
			image: <ExistingSiteImage />,
			description: translate(
				'Use with a site you already started. We will delete all content and your site will be upgraded if required.'
			),
		},
	];

	return (
		<ChoicesContainer>
			{ ! productsLoaded && <QueryProductsList /> }
			{ choices.map( ( choice ) => (
				<NewOrExistingSiteChoice
					key={ choice.type }
					choice={ choice }
					onSelect={ props.onSelect }
				/>
			) ) }
		</ChoicesContainer>
	);
}
