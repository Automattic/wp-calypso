import { localize } from 'i18n-calypso';
import { Component } from 'react';
import ExpandableSidebarMenu from 'calypso/layout/sidebar/expandable';
import ReaderFollowingIcon from 'calypso/reader/components/icons/following-icon';

export class ReaderSidebarRecent extends Component< {
	isOpen: boolean;
	onClick: () => void;
	className: string;
	translate: ( key: string ) => string;
} > {
	render() {
		const { translate, isOpen, onClick, className } = this.props;
		return (
			<li>
				<ExpandableSidebarMenu
					expanded={ isOpen }
					title={ translate( 'Recent' ) }
					onClick={ onClick }
					customIcon={ <ReaderFollowingIcon /> }
					disableFlyout
					className={ className }
					count={ undefined }
					icon={ null }
					materialIcon={ null }
					materialIconStyle={ null }
				>
					<li>Sites list here</li>
				</ExpandableSidebarMenu>
			</li>
		);
	}
}

export default localize( ReaderSidebarRecent );
