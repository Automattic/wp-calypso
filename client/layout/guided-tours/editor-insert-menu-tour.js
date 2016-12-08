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
	isUserOlderThan,
} from 'state/ui/guided-tours/contexts';

const TWO_DAYS_IN_MILLISECONDS = 2 * 1000 * 3600 * 24;

class RepositioningStep extends Step {

	componentDidMount() {
		super.componentDidMount();
		this.interval = setInterval( () => {
			this.onScrollOrResize();
		}, 2000 );
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		clearInterval( this.interval );
	}

}

export const EditorInsertMenuTour = makeTour(
	<Tour
		name="editorInsertMenu"
		path={ [ '/post/', '/page/' ] }
		version="20161129"
		when={ and(
			isEnabled( 'post-editor/insert-menu' ),
			isUserOlderThan( TWO_DAYS_IN_MILLISECONDS ),
		) }
	>
		<RepositioningStep
			arrow="left-top"
			name="init"
			placement="beside"
			target=".mce-wpcom-insert-menu"
			style={ { animationDelay: '10s' } }
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
		</RepositioningStep>
	</Tour>
);
