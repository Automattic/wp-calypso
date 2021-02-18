/**
 * External dependencies
 */

import React from 'react';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import SplitButton from '../';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import PopoverMenuSeparator from 'calypso/components/popover/menu-separator';
import { Card } from '@automattic/components';

const popoverItems = [
	<PopoverMenuItem key="sbe-oa" icon="add">
		Option A
	</PopoverMenuItem>,
	<PopoverMenuItem key="sbe-ob" icon="pencil">
		Option B
	</PopoverMenuItem>,
	<PopoverMenuSeparator key="sbe-sep" />,
	<PopoverMenuItem key="sbe-oc" icon="help">
		Option C
	</PopoverMenuItem>,
	<PopoverMenuItem key="sbe-od" disabled icon="cross-circle">
		Disabled option
	</PopoverMenuItem>,
];

class SplitButtonExample extends React.PureComponent {
	state = {
		compactButtons: false,
	};

	toggleButtons = () => this.setState( { compactButtons: ! this.state.compactButtons } );

	render() {
		const compact = { compact: this.state.compactButtons };
		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleButtons }>
					{ this.state.compactButtons ? 'Normal Buttons' : 'Compact Buttons' }
				</a>
				<Card>
					{ map(
						[
							[
								{ label: 'Split Button', icon: 'history' },
								{ label: 'Split Button', primary: true },
								{ icon: 'globe' },
							],
							[
								{ label: 'Split Button', primary: true, disableMain: true },
								{ label: 'Split Button', icon: 'history', primary: true, disableMenu: true },
							],
							[
								{ label: 'Split Button', primary: true, disabled: true },
								{ icon: 'globe', primary: true, disabled: true },
							],
							[
								{ label: 'Split Button', icon: 'history', scary: true },
								{ label: 'Split Button', primary: true, scary: true },
								{ icon: 'globe', scary: true },
							],
							[
								{ label: 'Split Button', primary: true, disableMain: true, scary: true },
								{
									label: 'Split Button',
									icon: 'history',
									primary: true,
									disableMenu: true,
									scary: true,
								},
							],
							[
								{ label: 'Split Button', primary: true, disabled: true, scary: true },
								{ icon: 'globe', primary: true, disabled: true, scary: true },
							],
						],
						( row, rowIndex ) => (
							<div className="docs__design-button-row" key={ `split-button-row-${ rowIndex }` }>
								{ map( row, ( item, itemIndex ) => (
									<SplitButton
										key={ `split-button-item-${ rowIndex }-${ itemIndex }` }
										{ ...item }
										{ ...compact }
									>
										{ popoverItems }
									</SplitButton>
								) ) }
							</div>
						)
					) }
				</Card>
			</div>
		);
	}
}

SplitButtonExample.displayName = 'SplitButton';

export default SplitButtonExample;
