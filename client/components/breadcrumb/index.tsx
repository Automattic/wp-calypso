import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { Key } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import { decodeEntities } from 'calypso/lib/formatting';

const flexAligned = {
	display: 'flex',
	alignItems: 'center',
};

const StyledUl = styled.ul`
	${ flexAligned };
	list-style-type: none;
	margin: 0;
`;

const StyledLi = styled.li`
	${ flexAligned };
	font-size: 13px;
	font-weight: 400;
	--color-link: var( --studio-gray-50 );
	& .info-popover {
		align-self: flex-start;
	}

	:last-of-type:not( :first-of-type ) {
		--color-link: var( --studio-gray-80 );
		font-weight: 500;
	}
`;

const StyledBackLink = styled.a`
	${ flexAligned };
	font-size: 13px;
	&,
	&:link,
	&:visited,
	&:hover,
	&:active {
		color: var( --studio-gray-80 );
	}
	> svg {
		margin-right: 5px;
	}
`;

const StyledRootLabel = styled.span`
	${ flexAligned };
	font-size: 1rem;
	font-weight: 600;
	color: var( --studio-gray-80 );
`;

const StyledItem = styled.div`
	display: flex;
`;

const StyledGridicon = styled( Gridicon )`
	margin: 0 12px;
	color: var( --color-neutral-10 );
`;

const HelpBuble = styled( InfoPopover )`
	margin-left: 7px;
	display: flex;
	align-items: center;
	& .gridicon {
		color: var( --studio-gray-30 );
	}
	&:focus {
		outline: thin dotted;
	}
`;

const renderHelpBubble = ( item: Item ) => {
	if ( ! item.helpBubble ) {
		return null;
	}

	return (
		<HelpBuble icon="help-outline" position="right">
			{ item.helpBubble }
		</HelpBuble>
	);
};

export type Item = { label: string; href?: string; helpBubble?: React.ReactElement };
interface Props {
	items: Item[];
	mobileItem?: Item;
	compact?: boolean;
}

const Breadcrumb: React.FunctionComponent< Props > = ( props ) => {
	const translate = useTranslate();
	const { items, mobileItem, compact = false } = props;

	if ( items.length === 1 ) {
		const [ item ] = items;
		return (
			<StyledItem>
				<StyledRootLabel>{ decodeEntities( item.label ) }</StyledRootLabel>
				{ renderHelpBubble( item ) }
			</StyledItem>
		);
	}

	if ( compact && items.length > 1 ) {
		const urlBack = mobileItem?.href ?? items[ items.length - 2 ].href;
		const label = mobileItem?.label ?? translate( 'Back' );
		return (
			<StyledBackLink href={ urlBack }>
				<Gridicon icon="chevron-left" size={ 18 } />
				{ decodeEntities( label ) }
			</StyledBackLink>
		);
	}

	if ( items.length > 1 ) {
		return (
			<StyledUl>
				{ items.map( ( item: { href?: string; label: string }, index: Key ) => (
					<StyledLi key={ index }>
						{ index !== 0 && <StyledGridicon icon="chevron-right" size={ 14 } /> }
						{ item.href && index !== items.length - 1 ? (
							<a href={ item.href }>{ item.label }</a>
						) : (
							<span>{ decodeEntities( item.label ) }</span>
						) }
						{ renderHelpBubble( item ) }
					</StyledLi>
				) ) }
			</StyledUl>
		);
	}
	// Default case -> items: []
	return null;
};

Breadcrumb.defaultProps = {
	items: [],
};

export default Breadcrumb;
