import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { Key } from 'react';
import InfoPopover from 'calypso/components/info-popover';

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

	:last-of-type:not( :first-of-type ) {
		--color-link: var( --studio-gray-80 );
		font-weight: 500;
	}
`;

const StyledBackLink = styled.a`
	${ flexAligned };
	font-size: 13px;
	color: var( --studio-gray-80 ) !important; // It uses --studio-gray-50 if not using important
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
	& .gridicon {
		color: var( --studio-gray-30 );
	}
`;

const renderHelpBubble = ( item: Item ) => {
	if ( ! item.helpBubble ) {
		return null;
	}

	return (
		<HelpBuble icon="help-outline" position={ 'right' }>
			{ item.helpBubble }
		</HelpBuble>
	);
};

type Item = { label: string; href?: string; helpBubble?: React.ReactElement };

interface Props {
	items: Item[];
	mobileItem?: string;
	compact?: boolean;
}

const Breadcrumb: React.FunctionComponent< Props > = ( { items, mobileItem, compact = false } ) => {
	const translate = useTranslate();

	if ( items.length === 0 ) {
		return null;
	}

	if ( items.length === 1 ) {
		const [ item ] = items;
		return (
			<StyledItem>
				<StyledRootLabel>{ item.label }</StyledRootLabel>
				{ renderHelpBubble( item ) }
			</StyledItem>
		);
	}

	if ( compact && items.length > 1 ) {
		return (
			<StyledBackLink href={ items[ items.length - 2 ].href }>
				<Gridicon icon="chevron-left" size={ 18 } />
				{ /*  Show the exactly previous page with items[ items.length - 2 ] */ }
				{ mobileItem ? mobileItem : translate( 'Back' ) }
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
							<span>{ item.label }</span>
						) }
						{ renderHelpBubble( item ) }
					</StyledLi>
				) ) }
			</StyledUl>
		);
	}
};

Breadcrumb.defaultProps = {
	items: [],
};

export default Breadcrumb;
