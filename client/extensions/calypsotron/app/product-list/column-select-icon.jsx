import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Button from 'components/button';
import Gridicon from 'gridicons/react/gridicon';
import ColumnMenu from './column-menu';

class ColumnSelectIcon extends React.Component {
	propTypes: {
		columns: PropTypes.array.isRequired,
		columnGroups: PropTypes.array.isRequired,
		display: PropTypes.object.isRequired,
		onColumnSelectIconClick: PropTypes.func.isRequired,
		onColumnSelect: PropTypes.func.isRequired,
	}

	render() {
		const __ = this.props.translate;
		const { display, columns, columnGroups, columnSelections, onColumnSelectIconClick, onColumnSelect } = this.props;

		return (
			<Button borderless ref="columnSelect" onClick={ onColumnSelectIconClick }>
				<Gridicon icon="cog" />
				<ColumnMenu
					columns={ columns }
					columnGroups={ columnGroups }
					columnSelections={ columnSelections }
					context={ this.refs.columnSelect }
					isVisible={ display.showColumnPanel }
					onColumnSelect={ onColumnSelect }
				/>
			</Button>
		);
	}
}

export default localize( ColumnSelectIcon );

