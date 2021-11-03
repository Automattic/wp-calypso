import { isEnabled } from '@automattic/calypso-config';
import { localize, LocalizeProps } from 'i18n-calypso';
import React from 'react';
import { build, write } from '../../icons';
import SelectItems, { SelectItem } from '../../select-items';
import SelectItemsAlt, { SelectAltItem } from '../../select-items-alt';
import type { IntentFlag } from './types';

type Intent = SelectItem< IntentFlag >;
type IntentAlt = SelectAltItem< IntentFlag >;

interface Props {
	onSelect: ( value: IntentFlag ) => void;
	translate: LocalizeProps[ 'translate' ];
}

const useIntents = ( { translate }: Pick< Props, 'translate' > ): Intent[] => {
	return [
		{
			key: 'write',
			title: translate( 'Write' ),
			description: translate( 'Share your ideas with the world' ),
			icon: write,
			value: 'write',
			actionText: translate( 'Start writing' ),
		},
		{
			key: 'build',
			title: translate( 'Build' ),
			description: translate( 'Begin creating your website' ),
			icon: build,
			value: 'build',
			actionText: translate( 'Start building' ),
		},
	];
};

const useIntentsAlt = ( { translate }: Pick< Props, 'translate' > ): IntentAlt[] => {
	return [
		{
			show: isEnabled( 'gutenboarding/import' ),
			key: 'import',
			description: translate( 'Already have an existing website?' ),
			value: 'import',
			actionText: translate( 'Import your site content' ),
		},
	];
};

const IntentScreen: React.FC< Props > = ( { onSelect, translate } ) => {
	const intents = useIntents( { translate } );
	const intentsAlt = useIntentsAlt( { translate } );

	return (
		<>
			<SelectItems items={ intents } onSelect={ onSelect } />
			<SelectItemsAlt items={ intentsAlt } onSelect={ onSelect } />
		</>
	);
};

export default localize( IntentScreen );
