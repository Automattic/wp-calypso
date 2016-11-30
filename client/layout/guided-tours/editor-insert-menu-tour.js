/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { overEvery as and } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ButtonRow,
	makeTour,
	Step,
	Tour,
	Quit,
} from 'layout/guided-tours/config-elements';
import {
	isEnabled,
	inSection,
} from 'state/ui/guided-tours/contexts';

export const EditorInsertMenuTour = makeTour(
	<Tour
		name="editorInsertMenu"
		path="/"
		version="20161129"
		when={ and(
			isEnabled( 'post-editor/insert-menu' ),
			inSection( 'post-editor' )
		) }
	>
		<Step
			arrow="left-top"
			name="init"
			next="hidden-step"
			placement="beside"
			target=".post_editor__insert-menu-guided-tour-anchor"
		>
			<p>
				{ translate(
					'{{strong}}Add Media{{/strong}} has moved to a new button.',
					{ components: { strong: <strong /> } }
				) }
			</p>
			<p>
				{ translate( 'Click here to see everything you can add.' ) }
			</p>
			<ButtonRow>
				<Quit primary>{ translate( 'Close' ) }</Quit>
			</ButtonRow>
		</Step>
		<Step name="hidden-step" />
	</Tour>
);
