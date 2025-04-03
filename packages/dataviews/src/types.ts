/**
 * External dependencies
 */
import type { ReactElement, ComponentType } from 'react';

/**
 * Internal dependencies
 */
import type { SetSelection } from './private-types';

export type SortDirection = 'asc' | 'desc';

/**
 * Generic option type.
 */
export interface Option< Value extends any = any > {
	value: Value;
	label: string;
	description?: string;
}

interface FilterByConfig {
	/**
	 * The list of operators supported by the field.
	 */
	operators?: Operator[];

	/**
	 * Whether it is a primary filter.
	 *
	 * A primary filter is always visible and is not listed in the "Add filter" component,
	 * except for the list layout where it behaves like a secondary filter.
	 */
	isPrimary?: boolean;
}

export type Operator =
	| 'is'
	| 'isNot'
	| 'isAny'
	| 'isNone'
	| 'isAll'
	| 'isNotAll';

export type FieldType = 'text' | 'integer' | 'datetime' | 'media';

export type ValidationContext = {
	elements?: Option[];
};

/**
 * An abstract interface for Field based on the field type.
 */
export type FieldTypeDefinition< Item > = {
	/**
	 * Callback used to sort the field.
	 */
	sort: ( a: Item, b: Item, direction: SortDirection ) => number;

	/**
	 * Callback used to validate the field.
	 */
	isValid: ( item: Item, context?: ValidationContext ) => boolean;

	/**
	 * Callback used to render an edit control for the field or control name.
	 */
	Edit: ComponentType< DataFormControlProps< Item > > | string;
};

/**
 * A dataview field for a specific property of a data type.
 */
export type Field< Item > = {
	/**
	 * Type of the fields.
	 */
	type?: FieldType;

	/**
	 * The unique identifier of the field.
	 */
	id: string;

	/**
	 * The label of the field. Defaults to the id.
	 */
	label?: string;

	/**
	 * The header of the field. Defaults to the label.
	 * It allows the usage of a React Element to render the field labels.
	 */
	header?: string | ReactElement;

	/**
	 * A description of the field.
	 */
	description?: string;

	/**
	 * Placeholder for the field.
	 */
	placeholder?: string;

	/**
	 * Callback used to render the field. Defaults to `field.getValue`.
	 */
	render?: ComponentType< DataViewRenderFieldProps< Item > >;

	/**
	 * Callback used to render an edit control for the field.
	 */
	Edit?: ComponentType< DataFormControlProps< Item > > | string;

	/**
	 * Callback used to sort the field.
	 */
	sort?: ( a: Item, b: Item, direction: SortDirection ) => number;

	/**
	 * Callback used to validate the field.
	 */
	isValid?: ( item: Item, context?: ValidationContext ) => boolean;

	/**
	 * Callback used to decide if a field should be displayed.
	 */
	isVisible?: ( item: Item ) => boolean;

	/**
	 * Whether the field is sortable.
	 */
	enableSorting?: boolean;

	/**
	 * Whether the field is searchable.
	 */
	enableGlobalSearch?: boolean;

	/**
	 * Whether the field is filterable.
	 */
	enableHiding?: boolean;

	/**
	 * The list of options to pick from when using the field as a filter.
	 */
	elements?: Option[];

	/**
	 * Filter config for the field.
	 */
	filterBy?: FilterByConfig | undefined;

	/**
	 * Callback used to retrieve the value of the field from the item.
	 * Defaults to `item[ field.id ]`.
	 */
	getValue?: ( args: { item: Item } ) => any;
};

export type NormalizedField< Item > = Field< Item > & {
	label: string;
	header: string | ReactElement;
	getValue: ( args: { item: Item } ) => any;
	render: ComponentType< DataViewRenderFieldProps< Item > >;
	Edit: ComponentType< DataFormControlProps< Item > >;
	sort: ( a: Item, b: Item, direction: SortDirection ) => number;
	isValid: ( item: Item, context?: ValidationContext ) => boolean;
	enableHiding: boolean;
	enableSorting: boolean;
};

/**
 * A collection of dataview fields for a data type.
 */
export type Fields< Item > = Field< Item >[];

export type Data< Item > = Item[];

export type DataFormControlProps< Item > = {
	data: Item;
	field: NormalizedField< Item >;
	onChange: ( value: Record< string, any > ) => void;
	hideLabelFromVision?: boolean;
};

export type DataViewRenderFieldProps< Item > = {
	item: Item;
};

/**
 * The filters applied to the dataset.
 */
export interface Filter {
	/**
	 * The field to filter by.
	 */
	field: string;

	/**
	 * The operator to use.
	 */
	operator: Operator;

	/**
	 * The value to filter by.
	 */
	value: any;
}

export interface NormalizedFilter {
	/**
	 * The field to filter by.
	 */
	field: string;

	/**
	 * The field name.
	 */
	name: string;

	/**
	 * The list of options to pick from when using the field as a filter.
	 */
	elements: Option[];

	/**
	 * Is a single selection filter.
	 */
	singleSelection: boolean;

	/**
	 * The list of operators supported by the field.
	 */
	operators: Operator[];

	/**
	 * Whether the filter is visible.
	 */
	isVisible: boolean;

	/**
	 * Whether it is a primary filter.
	 */
	isPrimary: boolean;
}

interface ViewBase {
	/**
	 * The layout of the view.
	 */
	type: string;

	/**
	 * The global search term.
	 */
	search?: string;

	/**
	 * The filters to apply.
	 */
	filters?: Filter[];

	/**
	 * The sorting configuration.
	 */
	sort?: {
		/**
		 * The field to sort by.
		 */
		field: string;

		/**
		 * The direction to sort by.
		 */
		direction: SortDirection;
	};

	/**
	 * The active page
	 */
	page?: number;

	/**
	 * The number of items per page
	 */
	perPage?: number;

	/**
	 * The fields to render
	 */
	fields?: string[];

	/**
	 * Title field
	 */
	titleField?: string;

	/**
	 * Media field
	 */
	mediaField?: string;

	/**
	 * Description field
	 */
	descriptionField?: string;

	/**
	 * Whether to show the title
	 */
	showTitle?: boolean;

	/**
	 * Whether to show the media
	 */
	showMedia?: boolean;

	/**
	 * Whether to show the description
	 */
	showDescription?: boolean;

	/**
	 * Whether to show the hierarchical levels.
	 */
	showLevels?: boolean;
}

export interface ColumnStyle {
	/**
	 * The width of the field column.
	 */
	width?: string | number;

	/**
	 * The minimum width of the field column.
	 */
	maxWidth?: string | number;

	/**
	 * The maximum width of the field column.
	 */
	minWidth?: string | number;
}

export type Density = 'compact' | 'balanced' | 'comfortable';

export interface ViewTable extends ViewBase {
	type: 'table';

	layout?: {
		/**
		 * The styles for the columns.
		 */
		styles?: Record< string, ColumnStyle >;

		/**
		 * The density of the view.
		 */
		density?: Density;
	};
}

export interface ViewList extends ViewBase {
	type: 'list';
}

export interface ViewGrid extends ViewBase {
	type: 'grid';

	layout?: {
		/**
		 * The fields to use as badge fields.
		 */
		badgeFields?: string[];

		/**
		 * The preview size of the grid.
		 */
		previewSize?: number;
	};
}

export type View = ViewList | ViewGrid | ViewTable;

interface ActionBase< Item > {
	/**
	 * The unique identifier of the action.
	 */
	id: string;

	/**
	 * The label of the action.
	 * In case we want to adjust the label based on the selected items,
	 * a function can be provided.
	 */
	label: string | ( ( items: Item[] ) => string );

	/**
	 * The icon of the action. (Either a string or an SVG element)
	 * This should be IconType from the components package
	 * but that import is breaking typescript build for the moment.
	 */
	icon?: any;

	/**
	 * Whether the action is disabled.
	 */
	disabled?: boolean;

	/**
	 * Whether the action is destructive.
	 */
	isDestructive?: boolean;

	/**
	 * Whether the action is a primary action.
	 */
	isPrimary?: boolean;

	/**
	 * Whether the item passed as an argument supports the current action.
	 */
	isEligible?: ( item: Item ) => boolean;

	/**
	 * Whether the action can be used as a bulk action.
	 */
	supportsBulk?: boolean;

	/**
	 * The context in which the action is visible.
	 * This is only a "meta" information for now.
	 */
	context?: 'list' | 'single';
}

export interface RenderModalProps< Item > {
	items: Item[];
	closeModal?: () => void;
	onActionPerformed?: ( items: Item[] ) => void;
}

export interface ActionModal< Item > extends ActionBase< Item > {
	/**
	 * Modal to render when the action is triggered.
	 */
	RenderModal: ( {
		items,
		closeModal,
		onActionPerformed,
	}: RenderModalProps< Item > ) => ReactElement;

	/**
	 * Whether to hide the modal header.
	 */
	hideModalHeader?: boolean;

	/**
	 * The header of the modal.
	 */
	modalHeader?: string;

	/**
	 * The size of the modal.
	 *
	 * @default 'medium'
	 */
	modalSize?: 'small' | 'medium' | 'large' | 'fill';
}

export interface ActionButton< Item > extends ActionBase< Item > {
	/**
	 * The callback to execute when the action is triggered.
	 */
	callback: (
		items: Item[],
		context: {
			registry: any;
			onActionPerformed?: ( items: Item[] ) => void;
		}
	) => void;
}

export type Action< Item > = ActionModal< Item > | ActionButton< Item >;

export interface ViewBaseProps< Item > {
	actions: Action< Item >[];
	data: Item[];
	fields: NormalizedField< Item >[];
	getItemId: ( item: Item ) => string;
	getItemLevel?: ( item: Item ) => number;
	isLoading?: boolean;
	onChangeView: ( view: View ) => void;
	onChangeSelection: SetSelection;
	selection: string[];
	setOpenedFilter: ( fieldId: string ) => void;
	onClickItem?: ( item: Item ) => void;
	isItemClickable: ( item: Item ) => boolean;
	view: View;
}

export interface ViewTableProps< Item > extends ViewBaseProps< Item > {
	view: ViewTable;
}

export interface ViewListProps< Item > extends ViewBaseProps< Item > {
	view: ViewList;
}

export interface ViewGridProps< Item > extends ViewBaseProps< Item > {
	view: ViewGrid;
}

export type ViewProps< Item > =
	| ViewTableProps< Item >
	| ViewGridProps< Item >
	| ViewListProps< Item >;

export interface SupportedLayouts {
	list?: Omit< ViewList, 'type' >;
	grid?: Omit< ViewGrid, 'type' >;
	table?: Omit< ViewTable, 'type' >;
}

export type SimpleFormField = {
	id: string;
	layout?: 'regular' | 'panel';
	labelPosition?: 'side' | 'top' | 'none';
};

export type CombinedFormField = {
	id: string;
	label?: string;
	layout?: 'regular' | 'panel';
	labelPosition?: 'side' | 'top' | 'none';
	children: Array< FormField | string >;
};

export type FormField = SimpleFormField | CombinedFormField;

/**
 * The form configuration.
 */
export type Form = {
	type?: 'regular' | 'panel';
	fields?: Array< FormField | string >;
	labelPosition?: 'side' | 'top' | 'none';
};

export interface DataFormProps< Item > {
	data: Item;
	fields: Field< Item >[];
	form: Form;
	onChange: ( value: Record< string, any > ) => void;
}

export interface FieldLayoutProps< Item > {
	data: Item;
	field: FormField;
	onChange: ( value: any ) => void;
	hideLabelFromVision?: boolean;
}
