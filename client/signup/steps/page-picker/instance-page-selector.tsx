import { isMobile } from '@automattic/viewport';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import { CUSTOM_PAGE, HOME_PAGE, SHOP_PAGE } from 'calypso/signup/difm/constants';
import {
	countInstancesOfType,
	getPageTypeOrderForPicker,
	isSingleOnly,
	nextInstanceId,
	type PageInstance,
} from 'calypso/signup/difm/page-instances';
import {
	useTranslatedPageDescriptionsMap,
	useTranslatedPageTitles,
} from 'calypso/signup/difm/translation-hooks';
import type { PageId } from 'calypso/signup/difm/constants';
import type { BBETranslationContext } from 'calypso/signup/difm/translation-hooks';

const DEFAULT_CUSTOM_TITLE = 'Custom Page';

const PageList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin: 0 0 30px;
	@media ( max-width: 600px ) {
		margin: 0 0 200px;
	}
`;

const PageRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
	padding: 12px 16px;
	background: var( --studio-white );
	border: 1px solid var( --studio-gray-10 );
	border-radius: 4px;
	font-size: 14px;
	font-weight: 500;
`;

const PageRowLabel = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
	min-width: 0;
	.info-popover {
		margin-inline-start: auto;
	}
`;

const StepperWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
`;

const StepperBtn = styled.button`
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var( --studio-gray-20 );
	border-radius: 4px;
	background: var( --studio-white );
	color: var( --studio-gray-80 );
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	&:hover:not( :disabled ) {
		background: var( --studio-gray-5 );
		border-color: var( --studio-gray-30 );
	}
	&:disabled {
		opacity: 0.5;
		cursor: default;
	}
`;

const StepperCount = styled.span`
	min-width: 24px;
	text-align: center;
	font-weight: 600;
`;

const IncludedBadge = styled.span`
	font-size: 12px;
	color: var( --studio-green-70 );
	font-weight: 500;
`;

const CustomInstanceList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
	margin-top: 8px;
	margin-inline-start: 16px;
`;

const CustomInstanceRow = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
`;

const CustomTitleInput = styled.input`
	flex: 1;
	min-width: 0;
	padding: 8px 12px;
	font-size: 14px;
	border: 1px solid var( --studio-gray-20 );
	border-radius: 4px;
`;

const RemoveInstanceBtn = styled.button`
	padding: 6px 12px;
	font-size: 13px;
	color: var( --studio-gray-60 );
	background: transparent;
	border: 1px solid var( --studio-gray-20 );
	border-radius: 4px;
	cursor: pointer;
	&:hover {
		color: var( --studio-red-60 );
		border-color: var( --studio-red-30 );
	}
`;

interface InstancePageSelectorProps {
	instances: PageInstance[];
	setInstances: ( updater: ( prev: PageInstance[] ) => PageInstance[] ) => void;
	isStoreFlow: boolean;
	context: BBETranslationContext;
}

export function InstancePageSelector( {
	instances,
	setInstances,
	isStoreFlow,
	context,
}: InstancePageSelectorProps ) {
	const translate = useTranslate();
	const titles = useTranslatedPageTitles();
	const descriptions = useTranslatedPageDescriptionsMap( context );

	const order = getPageTypeOrderForPicker( isStoreFlow );

	const count = ( type: PageId ) => countInstancesOfType( instances, type );

	const addOne = ( type: PageId ) => {
		setInstances( ( prev ) => {
			const id = nextInstanceId( type, prev );
			const title = type === CUSTOM_PAGE ? DEFAULT_CUSTOM_TITLE : undefined;
			return [ ...prev, { id, type, ...( title && { title } ) } ];
		} );
	};

	const removeOne = ( type: PageId ) => {
		if ( type === HOME_PAGE || type === SHOP_PAGE ) {
			return;
		}
		setInstances( ( prev ) => {
			const idx = prev.map( ( p ) => p.type ).lastIndexOf( type );
			if ( idx === -1 ) {
				return prev;
			}
			return prev.filter( ( _, i ) => i !== idx );
		} );
	};

	const setCustomTitle = ( instanceId: string, title: string ) => {
		setInstances( ( prev ) =>
			prev.map( ( p ) =>
				p.id === instanceId ? { ...p, title: title || DEFAULT_CUSTOM_TITLE } : p
			)
		);
	};

	const removeCustomInstance = ( instanceId: string ) => {
		setInstances( ( prev ) => prev.filter( ( p ) => p.id !== instanceId ) );
	};

	const customInstances = instances.filter( ( p ) => p.type === CUSTOM_PAGE );

	return (
		<PageList>
			{ order.map( ( type ) => {
				const single = isSingleOnly( type );
				const required = type === HOME_PAGE || ( type === SHOP_PAGE && isStoreFlow );
				const c = count( type );

				if ( required ) {
					return (
						<PageRow key={ type }>
							<PageRowLabel>
								<span>{ titles[ type ] }</span>
								<InfoPopover showOnHover position={ isMobile() ? 'left' : 'top left' }>
									{ descriptions[ type ] }
								</InfoPopover>
							</PageRowLabel>
							<IncludedBadge>{ translate( 'Included' ) }</IncludedBadge>
						</PageRow>
					);
				}

				if ( single ) {
					const isIncluded = c > 0;
					return (
						<PageRow key={ type }>
							<PageRowLabel>
								<span>{ titles[ type ] }</span>
								<InfoPopover showOnHover position={ isMobile() ? 'left' : 'top left' }>
									{ descriptions[ type ] }
								</InfoPopover>
							</PageRowLabel>
							<StepperWrap>
								<input
									type="checkbox"
									checked={ isIncluded }
									onChange={ () => {
										if ( isIncluded ) {
											removeOne( type );
										} else {
											addOne( type );
										}
									} }
									aria-label={ `${ titles[ type ] } ${ translate( 'Include' ) }` }
								/>
							</StepperWrap>
						</PageRow>
					);
				}

				// Multi-add
				return (
					<div key={ type }>
						<PageRow>
							<PageRowLabel>
								<span>{ titles[ type ] }</span>
								<InfoPopover showOnHover position={ isMobile() ? 'left' : 'top left' }>
									{ descriptions[ type ] }
								</InfoPopover>
							</PageRowLabel>
							<StepperWrap>
								<StepperBtn
									type="button"
									onClick={ () => removeOne( type ) }
									disabled={ c === 0 }
									aria-label={ translate( 'Remove one' ) }
								>
									−
								</StepperBtn>
								<StepperCount>{ c }</StepperCount>
								<StepperBtn
									type="button"
									onClick={ () => addOne( type ) }
									aria-label={ translate( 'Add one' ) }
								>
									+
								</StepperBtn>
							</StepperWrap>
						</PageRow>
						{ type === CUSTOM_PAGE && customInstances.length > 0 && (
							<CustomInstanceList>
								{ customInstances.map( ( inst ) => (
									<CustomInstanceRow key={ inst.id }>
										<CustomTitleInput
											value={ inst.title ?? '' }
											onChange={ ( e ) => setCustomTitle( inst.id, e.target.value ) }
											placeholder={ DEFAULT_CUSTOM_TITLE }
											aria-label={ translate( 'Page name' ) }
										/>
										<RemoveInstanceBtn
											type="button"
											onClick={ () => removeCustomInstance( inst.id ) }
										>
											{ translate( 'Remove' ) }
										</RemoveInstanceBtn>
									</CustomInstanceRow>
								) ) }
							</CustomInstanceList>
						) }
					</div>
				);
			} ) }
		</PageList>
	);
}
