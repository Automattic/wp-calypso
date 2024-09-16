import moment from 'moment';
import { addDayToRange } from '../date-range-picker';

// Mock Moment.js
jest.mock( 'moment', () => {
	const mMoment = {
		isSame: jest.fn(),
		isBefore: jest.fn(),
		isAfter: jest.fn(),
		diff: jest.fn(),
		locale: jest.fn(),
	};
	return jest.fn( () => mMoment );
} );

describe( 'addDayToRange', () => {
	let mockMoment;

	beforeEach( () => {
		mockMoment = moment();
		jest.clearAllMocks();
	} );

	test( 'should set start date when range is empty', () => {
		const result = addDayToRange( mockMoment, { from: null, to: null } );
		expect( result ).toEqual( { from: mockMoment, to: null } );
	} );

	test( 'should set end date when start date is set but end date is null', () => {
		const mockFrom = moment();
		const result = addDayToRange( mockMoment, { from: mockFrom, to: null } );
		expect( result ).toEqual( { from: mockFrom, to: mockMoment } );
	} );

	test( 'should clear start date when day is same as start date', () => {
		const mockFrom = moment();
		mockFrom.isSame.mockReturnValue( true );
		const result = addDayToRange( mockMoment, { from: mockFrom, to: null } );
		expect( result ).toEqual( { from: null, to: null } );
	} );

	test( 'should clear end date when day is same as end date', () => {
		const mockFrom = moment();
		const mockTo = moment();
		mockTo.isSame.mockReturnValue( true );
		const result = addDayToRange( mockMoment, { from: mockFrom, to: mockTo } );
		expect( result ).toEqual( { from: mockFrom, to: null } );
	} );

	test( 'should set start date when day is before current range', () => {
		const mockFrom = moment();
		const mockTo = moment();
		mockMoment.isBefore.mockReturnValue( true );
		const result = addDayToRange( mockMoment, { from: mockFrom, to: mockTo } );
		expect( result ).toEqual( { from: mockMoment, to: mockTo } );
	} );

	test( 'should set end date when day is after current range', () => {
		const mockFrom = moment();
		const mockTo = moment();
		mockMoment.isBefore.mockReturnValue( false );
		mockMoment.isAfter.mockReturnValue( true );
		const result = addDayToRange( mockMoment, { from: mockFrom, to: mockTo } );
		expect( result ).toEqual( { from: mockFrom, to: mockMoment } );
	} );

	test( 'should set start date when day is closer to start', () => {
		const mockFrom = moment();
		const mockTo = moment();
		mockMoment.isBefore.mockReturnValue( false );
		mockMoment.isAfter.mockReturnValue( false );
		mockFrom.diff.mockReturnValue( 1 );
		mockTo.diff.mockReturnValue( 2 );
		const result = addDayToRange( mockMoment, { from: mockFrom, to: mockTo } );
		expect( result ).toEqual( { from: mockMoment, to: mockTo } );
	} );

	test( 'should set end date when day is closer to end', () => {
		const mockFrom = moment();
		const mockTo = moment();
		mockMoment.isBefore.mockReturnValue( false );
		mockMoment.isAfter.mockReturnValue( false );
		mockFrom.diff.mockReturnValue( 2 );
		mockTo.diff.mockReturnValue( 1 );
		const result = addDayToRange( mockMoment, { from: mockFrom, to: mockTo } );
		expect( result ).toEqual( { from: mockFrom, to: mockMoment } );
	} );
} );
