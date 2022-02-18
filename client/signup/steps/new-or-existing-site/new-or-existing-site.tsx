import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import ExistingSiteImageUrl from 'calypso/assets/images/difm/existing-site-image.svg';
import NewSiteImageUrl from 'calypso/assets/images/difm/new-site-image.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import { getAvailableProductsList } from 'calypso/state/products-list/selectors';
import NewOrExistingSiteChoice from './new-or-existing-site-choice';
import { NewOrExistingSiteChoiceType, ChoiceType } from './types';

interface Props {
	onSelect: ( value: ChoiceType ) => void;
}

const ChoicesContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 24px;
`;

export default function NewOrExistingSiteScreen( props: Props ): React.ReactElement {
	const translate = useTranslate();
	const productsList = useSelector( getAvailableProductsList );
	const productsLoaded = ! isEmpty( productsList );
	const choices: NewOrExistingSiteChoiceType[] = [
		{
			type: 'new-site',
			label: translate( 'New site' ),
			imageUrl: NewSiteImageUrl,
			description: translate(
				'Start fresh. We will build your site from scratch. A free domain for one year is included.'
			),
		},
		{
			type: 'existing-site',
			label: translate( 'Existing WordPress.com site' ),
			imageUrl: ExistingSiteImageUrl,
			description: (
				<div>
					{ translate(
						'Use with a site you already started. ' +
							'We will delete all of your existing content, and your site will be upgraded to the Premium plan. ',
						{
							components: {
								small: <small />,
							},
						}
					) }
					<p>
						{ translate(
							'(Don’t worry, you’ll have the opportunity to upload the content you want on your new site in the content submission form.)'
						) }
					</p>
				</div>
			),
		},
	];

	/**
	 * Usually, the products list is queried in the domains step.
	 * However, the domains step will be skipped if the user chooses DIFM
	 * for an existing site. So we load the product list as early as possible in this flow.
	 */
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
