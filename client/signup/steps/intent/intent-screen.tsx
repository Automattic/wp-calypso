import { isEnabled } from '@automattic/calypso-config';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import { build, write, tip } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
import SelectItemsAlt, { SelectAltItem } from '../../select-items-alt';
import type { IntentFlag } from './types';

type Intent = SelectItem< IntentFlag >;
type IntentAlt = SelectAltItem< IntentFlag >;

interface Props {
	canImport: boolean;
	onSelect: ( value: IntentFlag ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const useIntents = ( { translate }: Pick< Props, 'translate' > ): Intent[] => {
	const intents: Intent[] = [
		{
			key: 'write',
			title: translate( 'Write' ),
			description: <p>{ translate( 'Share your ideas with the world' ) }</p>,
			icon: write,
			value: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'build',
			title: translate( 'Build' ),
			description: <p>{ translate( 'Begin creating your website' ) }</p>,
			icon: build,
			value: 'build',
			actionText: translate( 'Start building' ),
		},
	];

	if ( isEnabled( 'seller-experience' ) ) {
		intents.push( {
			key: 'sell',
			title: translate( 'Sell' ),
			description: <p>{ translate( 'Set up an online store' ) }</p>,
			icon: tip,
			value: 'sell',
			actionText: translate( 'Start selling' ),
		} );
	}

	return intents;
};

const useIntentsAlt = ( {
	canImport,
	translate,
}: Pick< Props, 'canImport' | 'translate' > ): IntentAlt[] => {
	return [
		{
			show: isEnabled( 'gutenboarding/import' ),
			key: 'import',
			description: translate( 'Already have an existing website?' ),
			value: 'import',
			actionText: translate( 'Import your site content' ),
			disable: ! canImport,
			disableText: translate(
				"You're not authorized to import content.{{br/}}Please check with your site admin.",
				{
					components: {
						br: <br />,
					},
				}
			),
		},
	];
};

const IntentScreen: React.FC< Props > = ( { canImport, onSelect, translate } ) => {
	const intents = useIntents( { translate } );
	const intentsAlt = useIntentsAlt( { translate, canImport } );

	return (
		<>
			<SelectItems items={ intents } onSelect={ onSelect } />
			<SelectItemsAlt items={ intentsAlt } onSelect={ onSelect } />
		</>
	);
};

export default localize( IntentScreen );
