import { useState, useRef, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import cabinetLogo from './assets/cabinet-logo.png'
import cabinetIcon from './assets/cabinet-icon.png'
import LoginPage from './LoginPage'

type AlertStatus = 'Pending' | 'Work Stop' | null

const REDESIGNED_NAV_ITEMS = new Set(['Dashboard', 'The Cellar', 'Companies', 'People'])

const NAV_ITEMS = [
  { icon: GridIcon, label: 'Dashboard', active: true },
  { icon: WineIcon, label: 'The Cellar', active: false },
  { icon: BuildingIcon, label: 'Companies', active: false },
  { icon: PeopleIcon, label: 'People', active: false },
  { icon: AgencyIcon, label: 'Agencies', active: false },
  { icon: QueryIcon, label: 'Query', active: false },
  { icon: LicenseIcon, label: 'Licensing', active: false },
  { icon: ReportIcon, label: 'Reporting', active: false },
  { icon: BulkIcon, label: 'Bulk Logins', active: false },
  { icon: UsersIcon, label: 'Users', active: false },
]

const FAVORITE_COMPANIES_INIT = [
  { name: '1 Matilda Wine Company, LLC', type: 'Client', dba: 'Bonkers', status: 'Archived', alertStatus: 'Pending' as AlertStatus, starred: true },
]

const RENEWALS = [
  { name: '1 Matilda Wine Company, LLC', state: 'CT', function: 'DTC', item: '', license: 'Asdfasdf', renewalDate: '04/28/2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'TTB', function: 'Operational', item: '', license: 'N/A', renewalDate: '07/11/2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'TTB', function: 'Operational', item: '', license: '12345', renewalDate: '07/07/2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'CA', function: 'Operational', item: '', license: '88888', renewalDate: '06/30/2026', expiryDate: '', actionDays: 'Expired' },
  { name: '1 Matilda Wine Company, LLC', state: 'CA', function: 'Operational', item: '', license: '54654654', renewalDate: '04/16/2026', expiryDate: '', actionDays: 'Expired' },
]

const CELLAR_TABS = ['My Action Items', 'Pending Changes', 'Final Decisions'] as const

type PendingRow = {
  id: number
  timestamp: string
  company: string
  detail: string
  field: string
  newValue: string
  badge: 'GL' | 'WL'
  initials: string
  notes: string
}

type ActionItemRow = {
  id: number
  requestDate: string
  companyContactName: string
  recordName: string
  field: string
  previousData: string
  updatedData: string
  notes: string
  requestedBy: string
}

const MY_ACTION_ITEMS: ActionItemRow[] = [
  {
    id: 1,
    requestDate: '07/28/2026 04:17:48 PM',
    companyContactName: '2Hawk LLC',
    recordName: '',
    field: 'EIN',
    previousData: '46-4447754',
    updatedData: '46-4447753',
    notes: 'EIN correction requested after IRS notification. Please verify updated EIN before approving.',
    requestedBy: 'RN',
  },
]

type FinalDecisionRow = {
  id: number
  companyContactName: string
  recordName: string
  field: string
  previousData: string
  updatedData: string
  decisionDate: string
  requestedBy: string
  specialist: string
  status: 'Approved' | 'Denied'
}

const FINAL_DECISIONS: FinalDecisionRow[] = [
  { id: 1, companyContactName: '1 Matilda Wine Company, LLC', recordName: 'Scott Zaleski', field: 'Active/Inactive', previousData: 'Active', updatedData: 'Inactive', decisionDate: '07/27/2026 02:14:11 PM', requestedBy: 'AD', specialist: 'GL', status: 'Approved' },
  { id: 2, companyContactName: 'Grape Nut', recordName: '1235 Fun Street', field: 'State', previousData: 'CA', updatedData: 'CT', decisionDate: '07/26/2026 11:08:33 AM', requestedBy: 'RN', specialist: 'AD', status: 'Denied' },
  { id: 3, companyContactName: '1 Matilda Wine Company, LLC', recordName: 'Bonkers', field: 'DBA', previousData: 'Bonkers LLC', updatedData: 'Bonkers', decisionDate: '07/25/2026 04:42:09 PM', requestedBy: 'GL', specialist: 'AD', status: 'Approved' },
  { id: 4, companyContactName: 'Folio Wine Company, LLC', recordName: 'Folio Wine Company, LLC', field: 'Entity Name', previousData: 'Folio Wines LLC', updatedData: 'Folio Wine Company, LLC', decisionDate: '07/24/2026 09:15:50 AM', requestedBy: 'AD', specialist: 'WL', status: 'Approved' },
  { id: 5, companyContactName: '3 Grapes Wine Company, LLC', recordName: 'Jackie Wu', field: 'Active/Inactive', previousData: 'Inactive', updatedData: 'Active', decisionDate: '07/23/2026 03:27:18 PM', requestedBy: 'WL', specialist: 'GL', status: 'Denied' },
  { id: 6, companyContactName: '4 Wines, LLC', recordName: '4 Wines', field: 'DBA', previousData: 'Four Wines', updatedData: '4 Wines', decisionDate: '07/22/2026 01:05:44 PM', requestedBy: 'RN', specialist: 'AD', status: 'Approved' },
  { id: 7, companyContactName: 'Bubbles, LLC', recordName: '100 Champagne Ave', field: 'Street', previousData: '100 Champagne Avenue', updatedData: '100 Champagne Ave', decisionDate: '07/21/2026 10:33:02 AM', requestedBy: 'AD', specialist: 'GL', status: 'Approved' },
  { id: 8, companyContactName: 'Amaze Holdings, Inc', recordName: 'Aaron Day', field: 'Email', previousData: 'aaron.old@amaze.co', updatedData: 'aaron@amaze.co', decisionDate: '07/20/2026 05:19:27 PM', requestedBy: 'HI', specialist: 'AD', status: 'Approved' },
  { id: 9, companyContactName: 'Vineyard 29, LLC', recordName: 'Vineyard 29, LLC', field: 'Entity Name', previousData: 'V29 LLC', updatedData: 'Vineyard 29, LLC', decisionDate: '07/19/2026 08:47:55 AM', requestedBy: 'GL', specialist: 'WL', status: 'Approved' },
  { id: 10, companyContactName: 'Paper Shredders, LLC', recordName: 'Operations', field: 'Active/Inactive', previousData: 'Active', updatedData: 'Inactive', decisionDate: '07/18/2026 12:11:40 PM', requestedBy: 'AD', specialist: 'RN', status: 'Approved' },
  { id: 11, companyContactName: 'Dusty River Wine Cellars', recordName: 'Aaron Inman', field: 'Role', previousData: 'Contact', updatedData: 'Client Contact', decisionDate: '07/17/2026 03:55:16 PM', requestedBy: 'RN', specialist: 'AD', status: 'Approved' },
  { id: 12, companyContactName: 'Aperture Cellars', recordName: 'Aaron Robertson', field: 'State', previousData: 'OR', updatedData: 'CA', decisionDate: '07/16/2026 09:22:08 AM', requestedBy: 'WL', specialist: 'GL', status: 'Approved' },
]

const PENDING_CHANGES: PendingRow[] = [
  { id: 1, timestamp: '06/03/2025 08:07:53 PM', company: 'Folio Wine Company, LLC', detail: 'Folio Wine Company, LLC', field: 'Entity Name', newValue: 'Folio Wine Company, LLC', badge: 'GL', initials: 'AD', notes: 'Legal entity name update submitted after state filing confirmation. Supporting documents attached for review.' },
  { id: 2, timestamp: '06/03/2025 08:07:53 PM', company: 'Folio Wine Company, LLC', detail: '123456 Grape Street', field: 'Street', newValue: '123456 Grape Streett', badge: 'GL', initials: 'RN', notes: 'Correcting street address typo on license record. Updated value matches county assessor records.' },
  { id: 3, timestamp: '06/03/2025 08:07:53 PM', company: 'Folio Wine Company, LLC', detail: 'CA - DTC - 82 Wine Direct Shipper', field: 'New License', newValue: '', badge: 'GL', initials: 'AD', notes: 'New direct-to-consumer license application pending state approval. Awaiting certificate upload.' },
  { id: 4, timestamp: '06/03/2025 08:07:53 PM', company: 'Folio Wine Company, LLC', detail: 'Folio Wine Company, LLC', field: 'Entity Name', newValue: 'Folio Wine Company, LLC', badge: 'WL', initials: 'WL', notes: 'Duplicate entity name change request from warehouse license specialist. Please coordinate with GL approval.' },
  { id: 5, timestamp: '06/03/2025 08:07:53 PM', company: 'Folio Wine Company, LLC', detail: '123456 Grape Street', field: 'Street', newValue: '123456 Grape Streett', badge: 'WL', initials: 'HI', notes: 'Street address correction for warehouse permit. Same update as GL record — approve together if possible.' },
  { id: 6, timestamp: '06/03/2025 08:07:53 PM', company: 'Folio Wine Company, LLC', detail: 'CA - DTC - 82 Wine Direct Shipper', field: 'New License', newValue: '', badge: 'WL', initials: 'AD', notes: '' },
  { id: 7, timestamp: '06/03/2025 08:07:53 PM', company: '3 Grapes Wine Company, LLC', detail: '3 Grapes Wine Company, LLC', field: 'Entity Name', newValue: '3 Grapes Wine Company, LLC', badge: 'WL', initials: 'RN', notes: 'Entity name standardized to match TTB registration. No other fields affected.' },
  { id: 8, timestamp: '06/03/2025 08:07:53 PM', company: '4 Wines, LLC', detail: '4 Wines', field: 'DBA', newValue: 'Four Wines', badge: 'WL', initials: 'GL', notes: 'DBA reverted to prior trade name per client request. Confirm marketing materials updated before approval.' },
  { id: 9, timestamp: '06/03/2025 08:07:53 PM', company: 'Bubbles, LLC', detail: '100 Champagne Ave', field: 'Street', newValue: '100 Champagne Avenue', badge: 'GL', initials: 'HI', notes: 'Full street suffix added for compliance with state mailing requirements.' },
]

type CompanyRow = {
  id: number
  name: string
  dba: string
  status: 'Archived' | 'Active' | 'Inactive'
  alert: AlertStatus
  type: string
  starred: boolean
}

const COMPANIES_INIT: CompanyRow[] = [
  { id: 1, name: '1 Matilda Wine Company, LLC', dba: 'Bonkers', status: 'Archived', alert: 'Work Stop', type: 'Client', starred: true },
  { id: 2, name: '1 Matilda Wine Company, LLC', dba: 'Impensata', status: 'Active', alert: 'Pending', type: 'Client', starred: false },
  { id: 3, name: '1 Matilda Wine Company, LLC', dba: '', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 4, name: '1 Matilda Wine Company, LLC', dba: 'Bonkers', status: 'Inactive', alert: null, type: 'Client', starred: false },
  { id: 5, name: '1 Matilda Wine Company, LLC', dba: '', status: 'Inactive', alert: null, type: 'Client', starred: false },
  { id: 6, name: '1 Matilda Wine Company, LLC', dba: 'Impensata', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 7, name: '1 Matilda Wine Company, LLC', dba: '', status: 'Inactive', alert: null, type: 'Client', starred: false },
  { id: 8, name: '1 Matilda Wine Company, LLC', dba: 'Bonkers', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 9, name: '1 Matilda Wine Company, LLC', dba: 'Impensata', status: 'Archived', alert: null, type: 'Client', starred: false },
  { id: 10, name: '1 Matilda Wine Company, LLC', dba: '', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 11, name: '101 Caves Lane LLC', dba: '', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 12, name: '11 Cellars', dba: '', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 13, name: '12 Spies Vineyards', dba: '', status: 'Active', alert: null, type: 'Client', starred: false },
  { id: 14, name: '14 Hands Winery', dba: '', status: 'Active', alert: null, type: 'Client', starred: false },
]

type PersonRow = {
  id: number
  name: string
  email: string
  company: string
  type: 'Client' | 'Agency' | 'Vendor' | 'Industry'
  category: 'Individual' | 'Shared Email'
  alert: AlertStatus
}

const PEOPLE_INIT: PersonRow[] = [
  { id: 1, name: 'Compliance Team', email: 'compliance@folio.com', company: 'Folio Wine Company, LLC', type: 'Client', category: 'Shared Email', alert: 'Work Stop' },
  { id: 2, name: 'Shared Compliance', email: 'test2@sharedemail.com', company: '1 Matilda Wine Company, LLC', type: 'Client', category: 'Shared Email', alert: null },
  { id: 3, name: 'Office Team', email: 'office@4wines.com', company: '4 Wines, LLC', type: 'Client', category: 'Shared Email', alert: null },
  { id: 4, name: 'Jackie Wu', email: 'jackie@wc.com', company: '3 Grapes Wine Company, LLC', type: 'Client', category: 'Shared Email', alert: 'Pending' },
  { id: 5, name: 'Operations', email: 'office@papershredderz.com', company: 'Paper Shredders, LLC', type: 'Vendor', category: 'Shared Email', alert: null },
  { id: 6, name: 'Compliance', email: 'compliance@v29.com', company: 'Vineyard 29, LLC', type: 'Client', category: 'Shared Email', alert: null },
  { id: 7, name: 'Aaron Day', email: 'aaron@amaze.co', company: 'Amaze Holdings, Inc', type: 'Client', category: 'Individual', alert: null },
  { id: 8, name: 'Aaron Fein', email: 'aaron@platinumwinepartners.com', company: 'Platinum Wine Partners, LLC', type: 'Client', category: 'Individual', alert: null },
  { id: 9, name: 'Aaron Inman', email: 'aaron@drccellars.com', company: 'Dusty River Wine Cellars', type: 'Client', category: 'Individual', alert: null },
  { id: 10, name: 'Aaron Michael Inman', email: 'aaron@drccellars.com', company: 'Dusty River Wine Cellars', type: 'Client', category: 'Individual', alert: null },
  { id: 11, name: 'Mr Aaron Mount', email: 'aaron@ancientolivetrees.com', company: 'Boutique Winery, LLC', type: 'Client', category: 'Individual', alert: null },
  { id: 12, name: 'Aaron Niderost', email: 'aaron@wineintubes.com', company: 'Tubes USA, Inc.', type: 'Client', category: 'Individual', alert: null },
  { id: 13, name: 'Aaron Robertson', email: 'aaron@aperture-cellars.com', company: 'Aperture Cellars', type: 'Client', category: 'Individual', alert: null },
  { id: 14, name: 'Aaron Lee', email: 'aaron@redwines.com', company: 'Red Wines, LLC', type: 'Client', category: 'Individual', alert: null },
  { id: 15, name: 'Abby Lynch', email: 'abby@boichfamilycellar.com', company: 'Mayacamas Farms LLC', type: 'Client', category: 'Individual', alert: null },
  { id: 16, name: 'Abby Watt', email: 'abby@medlockames.com', company: 'Sutro Wine Co., LLC', type: 'Client', category: 'Individual', alert: null },
  { id: 17, name: 'Abigail Moore-Reiter', email: 'abbie@abbiemooredesign.com', company: 'Moore-Reiter Design', type: 'Agency', category: 'Individual', alert: null },
  { id: 18, name: 'Adam Beck', email: 'adam.beck@slwc.com', company: "Stag's Leap Wine Cellars LLC", type: 'Client', category: 'Individual', alert: null },
]

const COMPANY_DETAIL_TABS = [
  'Summary',
  'Detail',
  'Addresses',
  'Contacts',
  'Ownership',
  'Licenses & Reporting',
  'Credentials',
  'Account Activity',
  'Scope',
  'Change Log',
  'Work Stop',
] as const

const PERSON_DETAIL_TABS = ['Summary', 'Detail', 'Business Addresses', 'Change Log', 'Notes'] as const

const PERSON_NOTE_TYPES = ['Flag', 'Note', 'Task'] as const

const PERSON_NOTES = [
  { id: 1, type: 'Flag', note: 'Remember This !', author: 'Hammad Iftikhar' },
  { id: 2, type: 'Note', note: 'Aaron confirmed as primary DTC contact for Amaze Holdings.', author: 'Alissa DeLaRiva' },
]

const PERSON_CHANGE_LOG = [
  {
    id: 1,
    statusDate: '07/12/2026 04:18:22 PM',
    field: 'Role, Email',
    previousData: 'Role: Contact, Email: aaron.old@amaze.co',
    updatedData: 'Role: Client Contact, Email: aaron@amaze.co',
    notes: '',
    requestedBy: 'AD',
  },
  {
    id: 2,
    statusDate: '05/28/2026 11:05:40 AM',
    field: 'Street, City',
    previousData: '',
    updatedData: 'Street: 1200 Innovation Way, City: Napa',
    notes: 'Added business address',
    requestedBy: 'HI',
  },
]

const PERSON_ADDRESSES = [
  {
    id: 1,
    company: 'Amaze Holdings, Inc',
    email: 'aaron@amaze.co',
    workPhone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  },
]

const SERVICE_SCOPE = [
  { department: 'DTC', serviceLevel: 'Full Service', subType: '—', serviceType: 'License Management', status: 'Active', specialists: 'AD, GL' },
  { department: 'Wholesale', serviceLevel: 'Monitoring', subType: 'State', serviceType: 'Compliance Review', status: 'Active', specialists: 'AD' },
  { department: 'Operational', serviceLevel: 'Full Service', subType: 'TTB', serviceType: 'Permit Support', status: 'Active', specialists: 'WL' },
]

const COMPANY_SCOPE = [
  { id: 1, department: 'OOS', serviceLevel: 'MM', serviceType: 'Licensing', subServiceType: '3T', status: 'Onboarding', specialists: 'AD', managedBy: 'DHWC', client: '' },
  { id: 2, department: 'OOS', serviceLevel: 'MM', serviceType: 'Licensing', subServiceType: 'DTC', status: 'Active', specialists: 'AD', managedBy: 'Client', client: '' },
  { id: 3, department: 'OOS', serviceLevel: 'MM', serviceType: 'Reporting', subServiceType: '3T', status: 'Active', specialists: 'AD, GL', managedBy: 'DHWC', client: '' },
]

const SCOPE_DEPARTMENTS = ['OOS', 'OPS']
const SCOPE_SERVICE_LEVELS = ['MM', 'Full Service', 'Monitoring']
const SCOPE_SERVICE_TYPES = ['Licensing', 'Reporting', 'License Management', 'Compliance Review', 'Permit Support']
const SCOPE_SUB_SERVICE_TYPES = ['3T', 'DTC', 'State', 'TTB', '—']
const SCOPE_STATUSES = ['Prospect', 'Onboarding', 'Active', 'Offboarding', 'Inactive']
const SCOPE_SPECIALISTS = ['AD', 'GL', 'WL', 'CC']
const SCOPE_SPECIALIST_NAMES: Record<string, string> = {
  AD: 'Alissa DeLaRiva',
  GL: 'Gina Lopez',
  WL: 'William Lee',
  CC: 'Compliance Cabinet',
}
const SCOPE_SHIP_VERSIONS = ['Autofile', 'Manual', 'Hybrid']
const SCOPE_LICENSE_TYPES = ['DTC', 'Wholesale', '3T', 'Operational']
const SCOPE_MANAGED_BY = ['Client', 'DHWC']

const COMPANY_CHANGE_LOG = [
  {
    id: 1,
    statusDate: '07/17/2026 07:59:19 PM',
    tab: 'Scope',
    recordName: '1260 Summit Lake LLC',
    field: 'Effective Date, EIN, Ownership Holder, Ownership Percentage',
    changeType: 'Update' as const,
    previousData: 'Ownership Holder: True, Ownership Percentage: 25%',
    updatedData: 'Ownership Holder: False, Ownership Percentage: 0%, Effective Date: 07/17/2026, EIN: 84-2219940',
    notes: '',
    requestedBy: 'HI',
    hasAction: true,
  },
  {
    id: 2,
    statusDate: '07/16/2026 03:22:11 PM',
    tab: 'Ownership',
    recordName: 'Jhon Miller',
    field: 'City, First Name, Last Name, Role',
    changeType: 'Add' as const,
    previousData: '',
    updatedData: 'City: Napa, First Name: Jhon, Last Name: Miller, Role: Managing Member',
    notes: '',
    requestedBy: 'AD',
    hasAction: true,
  },
  {
    id: 3,
    statusDate: '07/15/2026 11:08:44 AM',
    tab: 'Addresses',
    recordName: 'Primary Business Address',
    field: 'Street, City, Zip Code',
    changeType: 'Update' as const,
    previousData: 'Street: 100 Old Road, City: Sonoma, Zip Code: 95476',
    updatedData: 'Street: 1260 Summit Lake Rd, City: Angwin, Zip Code: 94508',
    notes: 'Client requested address correction',
    requestedBy: 'AD',
    hasAction: true,
  },
  {
    id: 4,
    statusDate: '07/14/2026 04:41:02 PM',
    tab: 'Licensing Summary',
    recordName: 'WA - DTC',
    field: 'Cancellation Date (DTC), Status (DTC)',
    changeType: 'Update' as const,
    previousData: 'Cancellation Date (DTC): —, Status (DTC): Active',
    updatedData: 'Cancellation Date (DTC): 07/14/2026, Status (DTC): Inactive',
    notes: '',
    requestedBy: 'HI',
    hasAction: true,
  },
  {
    id: 5,
    statusDate: '07/12/2026 09:15:33 AM',
    tab: 'Contacts',
    recordName: 'Kelly Joe',
    field: 'Email, Work Phone',
    changeType: 'Update' as const,
    previousData: 'Email: kelly@old.com, Work Phone: (707) 555-0100',
    updatedData: 'Email: kelly@1matilda.com, Work Phone: (707) 555-0142',
    notes: '',
    requestedBy: 'GL',
    hasAction: false,
  },
  {
    id: 6,
    statusDate: '07/10/2026 02:05:18 PM',
    tab: 'Credentials',
    recordName: 'Share DTC',
    field: 'Password, Pin',
    changeType: 'Update' as const,
    previousData: 'Password: ******, Pin: 1234',
    updatedData: 'Password: ******, Pin: 6789',
    notes: 'Rotated credentials',
    requestedBy: 'CC',
    hasAction: true,
  },
  {
    id: 7,
    statusDate: '07/08/2026 10:30:00 AM',
    tab: 'Detail',
    recordName: '1 Matilda Wine Company, LLC',
    field: 'DBA, Phone',
    changeType: 'Update' as const,
    previousData: 'DBA: —, Phone: —',
    updatedData: 'DBA: Bonkers, Phone: (707) 555-0199',
    notes: '',
    requestedBy: 'AD',
    hasAction: false,
  },
  {
    id: 8,
    statusDate: '07/05/2026 05:12:47 PM',
    tab: 'Scope',
    recordName: 'OOS · Licensing · DTC',
    field: 'Status, Specialist',
    changeType: 'Add' as const,
    previousData: '',
    updatedData: 'Status: Active, Specialist: AD',
    notes: 'New DTC scope line',
    requestedBy: 'HI',
    hasAction: true,
  },
  {
    id: 9,
    statusDate: '07/02/2026 01:44:09 PM',
    tab: 'Ownership',
    recordName: 'Former Partner LLC',
    field: 'Ownership Percentage, Status',
    changeType: 'Delete' as const,
    previousData: 'Ownership Percentage: 10%, Status: Active',
    updatedData: '',
    notes: 'Removed inactive owner',
    requestedBy: 'AD',
    hasAction: true,
  },
  {
    id: 10,
    statusDate: '06/28/2026 08:20:55 AM',
    tab: 'Account Activity',
    recordName: 'Renewal follow-up',
    field: 'Status, Flag',
    changeType: 'Update' as const,
    previousData: 'Status: Open, Flag: Yellow',
    updatedData: 'Status: Closed, Flag: Green',
    notes: '',
    requestedBy: 'WL',
    hasAction: false,
  },
]

const CHANGE_LOG_TABS = ['Scope', 'Ownership', 'Addresses', 'Licensing Summary', 'Contacts', 'Credentials', 'Detail', 'Account Activity']
const CHANGE_LOG_TYPES = ['Add', 'Update', 'Delete']
const CHANGE_LOG_REQUESTERS = ['HI', 'AD', 'GL', 'WL', 'CC']

const COMPANY_WORK_STOP = [
  {
    id: 1,
    status: 'Work Stop',
    effectiveDate: '07-16-2026 03:35:53 PM',
    endDate: '',
    dayCount: 1,
  },
  {
    id: 2,
    status: 'Work Stop',
    effectiveDate: '04-22-2026 12:42:05 PM',
    endDate: '07-16-2026 03:35:53 PM',
    dayCount: 86,
  },
]

const WORK_STOP_STATUSES = ['Work Stop', 'Pending']

const COMPANY_RENEWALS = [
  { state: 'CT', function: 'DTC', item: 'Wine Shipper', expiration: '04/28/2026', action: 'Expired' },
  { state: 'TTB', function: 'Operational', item: 'Basic Permit', expiration: '07/11/2026', action: 'Expired' },
  { state: 'TTB', function: 'Operational', item: 'Bond', expiration: '07/07/2026', action: 'Expired' },
  { state: 'CA', function: 'Operational', item: 'Type 02', expiration: '06/30/2026', action: 'Expired' },
  { state: 'CA', function: 'DTC', item: 'Direct Shipper', expiration: '04/16/2026', action: 'Expired' },
  { state: 'NY', function: 'DTC', item: 'Out-of-State Shipper', expiration: '05/01/2026', action: 'Expired' },
  { state: 'TX', function: 'Wholesale', item: 'Nonresident Seller', expiration: '03/22/2026', action: 'Expired' },
  { state: 'FL', function: 'DTC', item: 'Wine Shipper', expiration: '02/14/2026', action: 'Expired' },
  { state: 'WA', function: 'DTC', item: 'Certificate of Approval', expiration: '01/30/2026', action: 'Expired' },
  { state: 'OR', function: 'Wholesale', item: 'Certificate of Authority', expiration: '06/01/2026', action: 'Expired' },
]

const RECENT_CHANGES = [
  { type: 'License', detail: 'License (WA DTC) created by AD', date: '06/03/2025' },
  { type: 'Address', detail: 'Shipping address updated by GL', date: '05/28/2025' },
  { type: 'Scope', detail: 'Wholesale service level changed by AD', date: '05/12/2025' },
  { type: 'Detail', detail: 'DBA “Bonkers” confirmed by AD', date: '04/30/2025' },
  { type: 'License', detail: 'CA Direct Shipper marked expired by WL', date: '04/16/2025' },
  { type: 'Contact', detail: 'Kelly Joe added as Primary Contact by AD', date: '03/22/2025' },
  { type: 'Work Stop', detail: 'Work Stop enabled by AD', date: '03/10/2025' },
]

const COMPANY_CONTACTS = [
  { id: 1, name: '', role: 'Test', work: '(111) 111-1111', email: 'test2@sharedemail.com', street: '123', notes: '', specialist: 'Admin Admin', category: 'Shared Email', active: true, cell: '—' },
  { id: 2, name: 'Billy Bob', role: 'Wine Club', work: '', email: 'billy@matilda.com', street: '', notes: '', specialist: 'Alissa DeLaRiva', category: 'Individual', active: true, cell: '—' },
  { id: 3, name: 'Kelly Joe', role: 'DTC Reporting Contact', work: '(707) 555-0142', email: 'kelly@1matilda.com', street: '', notes: '', specialist: 'Alissa DeLaRiva', category: 'Individual', active: true, cell: '(707) 555-0198' },
]

const PAST_CONTACTS: typeof COMPANY_CONTACTS = [
  { id: 101, name: 'Ada Lovelace', role: 'Compliance', work: '(707) 555-0177', email: 'ada@matildawine.com', street: '100 Vineyard Lane', notes: 'Former primary compliance contact', specialist: 'Admin Admin', category: 'Individual', active: false, cell: '(707) 555-0133' },
  { id: 102, name: 'Sam Rivera', role: 'Billing', work: '(707) 555-0190', email: 'sam@matildawine.com', street: '', notes: '', specialist: 'Alissa DeLaRiva', category: 'Individual', active: false, cell: '—' },
]

const COMPANY_OWNERSHIP = [
  { id: 1, name: 'Mr Jhon Miller Senior (JM)', title: 'Director', ownershipPct: '', effectiveDate: '', cancellationDate: '', principalType: 'person' as const },
  { id: 2, name: 'Mr Jhon Miller Senior (JM)', title: 'Director', ownershipPct: '', effectiveDate: '', cancellationDate: '', principalType: 'person' as const },
  { id: 3, name: '1260 Summit Lake LLC', title: '', ownershipPct: '1', effectiveDate: '02-01-1996', cancellationDate: '02-01-2030', principalType: 'sub-company' as const },
]

const COMPANY_LICENSES = [
  { id: 1, state: 'AI', cityCounty: '', func: 'DTC', item: 'Direct Shippers', itemName: '', licenseNo: '', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 2, state: 'AZ', cityCounty: '', func: 'DTC', item: 'Direct Shippers', itemName: 'Wine Direct Shipper Permit', licenseNo: '09080016', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 3, state: 'CA', cityCounty: '', func: 'DTC', item: 'Direct Shippers', itemName: '', licenseNo: '', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 4, state: 'CA', cityCounty: '', func: 'DTC', item: 'Direct Shippers', itemName: 'Direct Shipper Permit', licenseNo: 'DS121', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 5, state: 'CA', cityCounty: '', func: 'Operational', item: 'Bond', itemName: 'Winegrower Bond', licenseNo: '', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 6, state: 'CA', cityCounty: '', func: 'Operational', item: 'Type 02', itemName: 'Winegrower', licenseNo: '58279', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 7, state: 'CO', cityCounty: '', func: 'DTC', item: 'Direct Shippers', itemName: 'Wine Direct Shipper Permit', licenseNo: '03-99999-0000', renewalDue: '', expiration: '', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 8, state: 'CT', cityCounty: '', func: 'DTC', item: 'Wine Shipper', itemName: 'Out-of-State Shipper', licenseNo: 'Asdfasdf', renewalDue: '04/28/2026', expiration: '04/28/2026', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 9, state: 'FL', cityCounty: 'Miami-Dade', func: 'DTC', item: 'Wine Shipper', itemName: 'Direct Shipper', licenseNo: 'FL-4412', renewalDue: '02/14/2026', expiration: '02/14/2026', actionIn: 'Expired', status: 'Canceled', comment: 'Replaced by new permit' },
  { id: 10, state: 'NY', cityCounty: '', func: 'DTC', item: 'Out-of-State Shipper', itemName: 'Direct Wine Shipper', licenseNo: 'NY-8821', renewalDue: '05/01/2026', expiration: '05/01/2026', actionIn: '12', status: 'Active', comment: '' },
  { id: 11, state: 'TX', cityCounty: '', func: 'Wholesale', item: 'Nonresident Seller', itemName: 'Nonresident Seller Permit', licenseNo: 'TX-10044', renewalDue: '03/22/2026', expiration: '03/22/2026', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 12, state: 'TTB', cityCounty: '', func: 'Operational', item: 'Basic Permit', itemName: 'Basic Permit', licenseNo: '12345', renewalDue: '07/11/2026', expiration: '07/11/2026', actionIn: '45', status: 'Active', comment: '' },
  { id: 13, state: 'WA', cityCounty: 'King', func: 'DTC', item: 'Certificate of Approval', itemName: 'COA', licenseNo: 'WA-2201', renewalDue: '01/30/2026', expiration: '01/30/2026', actionIn: 'Expired', status: 'Active', comment: '' },
  { id: 14, state: 'OR', cityCounty: '', func: 'Wholesale', item: 'Certificate of Authority', itemName: 'Certificate of Authority', licenseNo: 'OR-5510', renewalDue: '06/01/2026', expiration: '06/01/2026', actionIn: '28', status: 'Active', comment: '' },
]

const COMPANY_REPORTING = [
  { id: 1, state: 'AK', func: '3T', filingFrequency: 'Annual', type: 'Bottle Bill', filingType: 'Online', accountNo: '123', dueDate: '31st', login: 'matilda_ak', password: '••••••••', pin: '4821', reportingNotes: '', filingNotes: '', active: true },
  { id: 2, state: 'TTB', func: 'Operational', filingFrequency: 'Annual', type: 'Bottle Bill', filingType: 'Online', accountNo: '12345', dueDate: '31st', login: 'matilda_ttb', password: '••••••••', pin: '9930', reportingNotes: 'Pay.gov account', filingNotes: '', active: true },
  { id: 3, state: 'CO', func: '3T, DTC', filingFrequency: 'Monthly', type: 'Excise', filingType: 'Online', accountNo: '555', dueDate: '20th', login: 'matilda_co', password: '••••••••', pin: '1174', reportingNotes: '', filingNotes: 'File via Revenue Online', active: true },
]

const REPORT_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'TTB', 'AI',
]

const REPORT_FUNCTIONS = ['3T', 'DTC', '3T, DTC', 'Operational', 'Wholesale']
const REPORT_TYPES = ['Bottle Bill', 'Excise', 'Sales', 'Shipment', 'Operations']
const REPORT_FILING_TYPES = ['Online', 'Paper', 'Email']
const REPORT_FREQUENCIES = ['Monthly', 'Quarterly', 'Semi-Annual', 'Annual']

const PAST_REPORTING: typeof COMPANY_REPORTING = [
  { id: 101, state: 'NY', func: 'DTC', filingFrequency: 'Quarterly', type: 'Sales', filingType: 'Paper', accountNo: '778', dueDate: '15th', login: '—', password: '—', pin: '—', reportingNotes: 'Filing suspended', filingNotes: '', active: false },
]

const COMPANY_CREDENTIALS = [
  { id: 1, loginOwner: 'Alaska Medeas Share', shared: true, sharedType: 'Client', state: 'AK', func: '3T', loginType: 'Shared', companyName: 'Alaska Medeas Share', filingType: 'Online', userName: 'Matilda2022', loginEmail: '', password: 'Matilda2050', pin: '2960', website: 'https://myalaska.state.ak.us', secretQuestion: 'First pet name?', managedBy: 'CC', reportingNotes: 'CC', licensingNotes: 'CC', active: true },
  { id: 2, loginOwner: 'Share DTC', shared: true, sharedType: 'Autofile', state: 'CO', func: '3T, DTC', loginType: 'Shared DTC', companyName: 'Share DTC', filingType: 'Online', userName: '00519656', loginEmail: 'ops@matilda.com', password: 'Matilda2047', pin: '6789', website: 'www.colorado.gov/revenueonline/_/#1', secretQuestion: '', managedBy: 'CC', reportingNotes: 'CC', licensingNotes: 'CC', active: true },
]

const PAST_CREDENTIALS: typeof COMPANY_CREDENTIALS = []

const CREDENTIAL_LOGIN_OWNERS = [
  'Alaska Medeas Share',
  'Share DTC',
  '1 Matilda Wine Company, LLC',
  'Compliance Cabinet Shared',
  'Agency Portal — TTB',
]
const CREDENTIAL_LOGIN_TYPES = ['Shared', 'Shared DTC', 'Individual', 'Agency']
const CREDENTIAL_FILING_TYPES = ['Online', 'Paper', 'Email']
const CREDENTIAL_FUNCTIONS = ['3T', 'DTC', '3T, DTC', 'Operational', 'Wholesale']
const CREDENTIAL_SHARED_TYPES = ['Autofile', 'Client']

type ActivityComment = {
  id: number
  author: string
  text: string
  date: string
  parentId: number | null
}

const COMPANY_ACCOUNT_ACTIVITY = [
  {
    id: 1,
    date: '06/01/2026 06:26:19 PM',
    subject: 'Test By AD',
    type: 'Issue',
    status: 'Open',
    flag: 'Green',
    category: 'Financial',
    department: 'OPS',
    backgroundDetails: 'Initial compliance review flagged a billing discrepancy on the Q1 filing. Follow up with finance team required.',
    authors: ['AD'],
    following: true,
    comments: [
      { id: 1, author: 'AD', text: 'Initial compliance review flagged a billing discrepancy on the Q1 filing. Follow up with finance team required.', date: '06/01/2026 06:26:19 PM', parentId: null },
      { id: 2, author: 'GL', text: 'Reached out to finance — waiting on Q1 invoice backup.', date: '06/02/2026 10:14:02 AM', parentId: null },
      { id: 3, author: 'AD', text: 'Thanks — please escalate if no reply by Friday.', date: '06/02/2026 11:05:40 AM', parentId: 2 },
    ],
  },
  {
    id: 2,
    date: '05/18/2026 02:14:08 PM',
    subject: 'License renewal reminder',
    type: 'Note',
    status: 'Closed',
    flag: 'Yellow',
    category: 'Licensing',
    department: 'OOS',
    backgroundDetails: 'CA Type 02 license renewal due in 45 days. Client notified via email.',
    authors: ['GL'],
    following: false,
    comments: [
      { id: 1, author: 'GL', text: 'CA Type 02 license renewal due in 45 days. Client notified via email.', date: '05/18/2026 02:14:08 PM', parentId: null },
    ],
  },
  {
    id: 3,
    date: '04/22/2026 10:05:33 AM',
    subject: 'TTB operations report filed',
    type: 'Task',
    status: 'Closed',
    flag: 'Green',
    category: 'Reporting',
    department: 'OPS',
    backgroundDetails: 'February operations report submitted through Permits Online. Confirmation #TTB-88421.',
    authors: ['WL', 'AD'],
    following: false,
    comments: [
      { id: 1, author: 'WL', text: 'February operations report submitted through Permits Online. Confirmation #TTB-88421.', date: '04/22/2026 10:05:33 AM', parentId: null },
    ],
  },
]

const ACTIVITY_TYPES = ['Issue', 'Note', 'Task', 'Call', 'Email']
const ACTIVITY_STATUSES = ['Open', 'In Progress', 'Pending', 'Closed']
const ACTIVITY_FLAGS = ['Green', 'Yellow', 'Red', 'Blue']
const ACTIVITY_CATEGORIES = ['Financial', 'Licensing', 'Reporting', 'Operations', 'Compliance']
const ACTIVITY_DEPARTMENTS = ['OOS', 'OPS']
const ACTIVITY_AUTHORS = ['AD', 'GL', 'WL', 'CC']

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]

const COMPANY_ADDRESSES = [
  { id: 1, label: 'Client Mailing', street: '1000 Main Street', city: 'Napa', state: 'CA', zip: '94558', country: 'United States', active: true },
  { id: 2, label: 'Client Mailing/Tasting Room', street: '1000 Main Street', city: 'Napa', state: 'CA', zip: '94558', country: 'United States', active: true },
  { id: 3, label: 'Office', street: '1000 Main Street', city: 'Napa', state: 'CA', zip: '94558', country: 'United States', active: true },
]

const PAST_ADDRESSES: typeof COMPANY_ADDRESSES = [
  { id: 101, label: 'Former Warehouse', street: '412 Industrial Blvd', city: 'Santa Rosa', state: 'CA', zip: '95401', country: 'United States', active: false },
  { id: 102, label: 'Old Billing Address', street: '88 Oak Avenue', city: 'Sonoma', state: 'CA', zip: '95476', country: 'United States', active: false },
  { id: 103, label: 'Previous HQ', street: '250 Barrel Road, Suite 2', city: 'St. Helena', state: 'CA', zip: '94574', country: 'United States', active: false },
]

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [favorites, setFavorites] = useState(FAVORITE_COMPANIES_INIT)
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null)
  const [companyTab, setCompanyTab] = useState<(typeof COMPANY_DETAIL_TABS)[number]>('Summary')
  const [companySubPage, setCompanySubPage] = useState<string | null>(null)
  const [addingCompany, setAddingCompany] = useState(false)
  const [companies, setCompanies] = useState<CompanyRow[]>(COMPANIES_INIT)
  const [selectedPerson, setSelectedPerson] = useState<PersonRow | null>(null)
  const [personTab, setPersonTab] = useState<(typeof PERSON_DETAIL_TABS)[number]>('Summary')
  const [addingPerson, setAddingPerson] = useState(false)
  const [people, setPeople] = useState<PersonRow[]>(PEOPLE_INIT)
  const [cellarTab, setCellarTab] = useState<(typeof CELLAR_TABS)[number]>('My Action Items')
  const [actionItems, setActionItems] = useState<ActionItemRow[]>(MY_ACTION_ITEMS)

  useEffect(() => {
    const closeNotifications = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeNotifications)
    return () => document.removeEventListener('mousedown', closeNotifications)
  }, [])

  const toggleStar = (index: number) => {
    setFavorites(prev => prev.map((c, i) => i === index ? { ...c, starred: !c.starred } : c))
  }

  const setAlertStatus = (index: number, status: AlertStatus) => {
    setFavorites(prev => prev.map((c, i) => i === index ? { ...c, alertStatus: status } : c))
  }

  const clearCompanySelection = () => {
    setSelectedCompanyId(null)
    setCompanyTab('Summary')
    setCompanySubPage(null)
    setAddingCompany(false)
  }

  const clearPersonSelection = () => {
    setSelectedPerson(null)
    setPersonTab('Summary')
    setAddingPerson(false)
  }

  const handleNavClick = (label: string) => {
    setActiveNav(label)
    if (label !== 'Companies') clearCompanySelection()
    if (label !== 'People') clearPersonSelection()
  }

  const handleSelectCompany = (id: number) => {
    setSelectedCompanyId(id)
    setCompanyTab('Summary')
    setCompanySubPage(null)
    setAddingCompany(false)
  }

  const handleSelectPerson = (person: PersonRow) => {
    setSelectedPerson(person)
    setPersonTab('Summary')
    setAddingPerson(false)
  }

  const handleCompanyTabChange = (tab: (typeof COMPANY_DETAIL_TABS)[number]) => {
    if (tab === 'Ownership') return
    setCompanyTab(tab)
    setCompanySubPage(null)
  }

  const selectedCompany = selectedCompanyId != null
    ? companies.find(c => c.id === selectedCompanyId) ?? null
    : null

  const isRedesignedNav = REDESIGNED_NAV_ITEMS.has(activeNav)

  const breadcrumbTrail: { label: string; onClick?: () => void }[] = (() => {
    if (activeNav === 'The Cellar') {
      return [{ label: 'The Cellar' }, { label: cellarTab }]
    }
    if (activeNav === 'Companies') {
      if (addingCompany) {
        return [
          { label: 'Companies', onClick: () => setAddingCompany(false) },
          { label: 'Add New' },
        ]
      }
      if (!selectedCompany) {
        return [{ label: 'Companies' }, { label: 'All Companies' }]
      }
      const trail: { label: string; onClick?: () => void }[] = [
        { label: 'Companies', onClick: clearCompanySelection },
        {
          label: companyTab,
          onClick: companySubPage ? () => setCompanySubPage(null) : undefined,
        },
      ]
      if (companySubPage) trail.push({ label: companySubPage })
      return trail
    }
    if (activeNav === 'People') {
      if (addingPerson) {
        return [
          { label: 'People', onClick: () => setAddingPerson(false) },
          { label: 'Add New' },
        ]
      }
      if (!selectedPerson) {
        return [{ label: 'People' }, { label: 'All People' }]
      }
      return [
        { label: 'People', onClick: clearPersonSelection },
        { label: personTab },
      ]
    }
    if (!isRedesignedNav) {
      return [{ label: activeNav }]
    }
    return [{ label: 'Dashboard' }, { label: 'Overview' }]
  })()

  if (!loggedIn) {
    return <LoginPage onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-[#FFFFFF] text-slate-600 transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarCollapsed ? 'w-[68px]' : 'w-[200px]'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-center px-3 py-4 border-b border-slate-200">
          {sidebarCollapsed ? (
            <div className="w-9 h-9 flex items-center justify-center flex-shrink-0">
              <img
                src={cabinetIcon}
                alt="Cabinet"
                className="w-9 h-9 object-contain"
              />
            </div>
          ) : (
            <img
              src={cabinetLogo}
              alt="Cabinet Compliance Management Software"
              className="w-full h-auto object-contain"
            />
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => handleNavClick(label)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative group ${
                activeNav === label
                  ? 'bg-[#12518c]/10 text-[#12518c]'
                  : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {activeNav === label && (
                <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#12518c] rounded-r" />
              )}
              <Icon active={activeNav === label} />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium truncate flex-1 text-left">{label}</span>
                  {label === 'The Cellar' && actionItems.length > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-[18px] text-center flex-shrink-0">
                      {actionItems.length}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center gap-2 px-4 py-4 border-t border-slate-200 text-slate-500 hover:text-slate-700 transition-colors text-xs"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d={sidebarCollapsed ? 'M4 2l5 5-5 5' : 'M10 2L5 7l5 5'} stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-slate-500 min-w-0">
            {breadcrumbTrail.map((crumb, i) => {
              const isLast = i === breadcrumbTrail.length - 1
              return (
                <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && <span className="text-slate-300 flex-shrink-0">/</span>}
                  {crumb.onClick && !isLast ? (
                    <button
                      type="button"
                      onClick={crumb.onClick}
                      className="hover:text-[#12518c] transition-colors truncate"
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className={`truncate ${isLast ? 'text-slate-800 font-medium' : ''}`}>
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-[#a1802b] bg-[#e1c16e]/15 border border-[#e1c16e]/60 px-2.5 py-1 rounded-full font-medium">Staging Server</span>
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(open => !open)}
                className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  notificationsOpen ? 'bg-slate-100 text-[#12518c]' : 'hover:bg-slate-100'
                }`}
                aria-label="3 unread notifications"
                aria-expanded={notificationsOpen}
                title="Notifications"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 1a5 5 0 0 1 5 5c0 3 1.5 4 1.5 4H1.5S3 9 3 6a5 5 0 0 1 5-5z" strokeLinecap="round" />
                  <path d="M6.5 13a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-danger text-white text-[9px] font-bold leading-4 text-center ring-2 ring-white">
                  3
                </span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                    <span className="rounded-full bg-danger-light px-2 py-0.5 text-[10px] font-semibold text-danger">3 new</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { title: 'License renewal is due soon', detail: 'California Type 02 license expires in 45 days.', time: '10 min ago' },
                      { title: 'New account activity', detail: 'A new compliance comment was added by GL.', time: '1 hour ago' },
                      { title: 'Scope record updated', detail: 'The Operations service scope was changed.', time: 'Yesterday' },
                    ].map(notification => (
                      <button
                        key={notification.title}
                        type="button"
                        className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                      >
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-danger" />
                        <span className="min-w-0">
                          <span className="block text-xs font-semibold text-slate-800">{notification.title}</span>
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">{notification.detail}</span>
                          <span className="mt-1 block text-[10px] text-slate-400">{notification.time}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="w-full border-t border-slate-100 px-4 py-2.5 text-xs font-semibold text-[#12518c] transition-colors hover:bg-slate-50"
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#12518c] flex items-center justify-center text-white text-xs font-semibold">HI</div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">Hammad Iftikhar</span>
              <button
                onClick={() => setLoggedIn(false)}
                title="Logout"
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
                  <path d="M10.5 11.5L14 8l-3.5-3.5M14 8H6" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeNav === 'The Cellar' ? (
            <CellarPage
              activeTab={cellarTab}
              onTabChange={setCellarTab}
              actionItems={actionItems}
              onActionItemsChange={setActionItems}
            />
          ) : activeNav === 'Companies' ? (
            addingCompany ? (
              <AddCompanyPage
                onCancel={() => setAddingCompany(false)}
                onSave={company => {
                  setCompanies(prev => [company, ...prev])
                  setSelectedCompanyId(company.id)
                  setCompanyTab('Summary')
                  setCompanySubPage(null)
                  setAddingCompany(false)
                }}
              />
            ) : selectedCompany ? (
              <CompanySummaryPage
                company={selectedCompany}
                tab={companyTab}
                subPage={companySubPage}
                onTabChange={handleCompanyTabChange}
                onSubPageChange={setCompanySubPage}
              />
            ) : (
              <CompaniesPage
                companies={companies}
                onCompaniesChange={setCompanies}
                onSelectCompany={handleSelectCompany}
                onAddCompany={() => setAddingCompany(true)}
              />
            )
          ) : activeNav === 'People' ? (
            addingPerson ? (
              <AddPersonPage
                onCancel={() => setAddingPerson(false)}
                onSave={person => {
                  setPeople(prev => [person, ...prev])
                  setSelectedPerson(person)
                  setPersonTab('Summary')
                  setAddingPerson(false)
                }}
              />
            ) : selectedPerson ? (
              <PersonDetailPage
                key={selectedPerson.id}
                person={selectedPerson}
                tab={personTab}
                onTabChange={setPersonTab}
                onBack={clearPersonSelection}
                onDelete={() => {
                  setPeople(prev => prev.filter(p => p.id !== selectedPerson.id))
                  clearPersonSelection()
                }}
                onAlertChange={status => {
                  setSelectedPerson(prev => (prev ? { ...prev, alert: status } : prev))
                  setPeople(prev => prev.map(p => (p.id === selectedPerson.id ? { ...p, alert: status } : p)))
                }}
              />
            ) : (
              <PeoplePage
                people={people}
                onPeopleChange={setPeople}
                onSelectPerson={handleSelectPerson}
                onAddPerson={() => setAddingPerson(true)}
              />
            )
          ) : activeNav === 'Dashboard' ? (
            <DashboardPage
              favorites={favorites}
              toggleStar={toggleStar}
              setAlertStatus={setAlertStatus}
            />
          ) : (
            <WorkInProgressPage title={activeNav} />
          )}

          {/* Footer */}
          <div className="mt-8 flex flex-col items-center gap-1 pb-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" opacity="0.5">
                <path d="M10 2a8 8 0 1 0 0 16A8 8 0 0 0 10 2zm1 11H9V9h2v4zm0-6H9V5h2v2z" />
              </svg>
              <span className="text-xs text-slate-400">www.dhwinecompliance.com</span>
            </div>
            <span className="text-xs text-slate-300">v 1.4.0</span>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Pages ───────────────────────────────────────────────────────── */

function WorkInProgressPage({ title }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center animate-[fadeIn_0.25s_ease-out]">
      <div className="w-16 h-16 rounded-2xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>
      {title && <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">{title}</p>}
      <h1 className="text-2xl font-bold text-slate-900">Work in Progress</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-sm">
        This page is being redesigned and will be available soon.
      </p>
    </div>
  )
}

type Favorite = {
  name: string
  type: string
  dba: string
  status: string
  alertStatus: AlertStatus
  starred: boolean
}

function DashboardPage({
  favorites,
  toggleStar,
  setAlertStatus,
}: {
  favorites: Favorite[]
  toggleStar: (index: number) => void
  setAlertStatus: (index: number, status: AlertStatus) => void
}) {
  const favCols = useTableColumns([
    { key: 'name', label: 'Company Name' },
    { key: 'type', label: 'Company Type' },
    { key: 'dba', label: 'DBA' },
    { key: 'status', label: 'Status' },
    { key: 'alerts', label: 'Alerts' },
  ])
  const renewalCols = useTableColumns([
    { key: 'name', label: 'Company Name' },
    { key: 'state', label: 'State' },
    { key: 'function', label: 'Function' },
    { key: 'item', label: 'Item Name' },
    { key: 'license', label: 'License/Permit #' },
    { key: 'renewalDate', label: 'Renewal Due Date' },
    { key: 'expiryDate', label: 'Expiration Date' },
    { key: 'actionDays', label: 'Action (Days)' },
  ])
  const favColBtn = 'p-2 rounded-lg transition-all duration-200'

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Compliance Management Overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Licenses', value: '24', change: '+2 this month', color: 'bg-[#12518c]/10 text-[#12518c]' },
          { label: 'Expired', value: '5', change: 'Needs attention', color: 'bg-danger-light text-danger' },
          { label: 'Renewing Soon', value: '12', change: 'Next 30 days', color: 'bg-[#e1c16e]/15 text-[#a1802b]' },
          { label: 'Favorite Companies', value: '1', change: 'Pinned', color: 'bg-emerald-50 text-emerald-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md mb-3 ${stat.color}`}>
              {stat.change}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">My Favorite Companies</h2>
            <p className="text-xs text-slate-500 mt-0.5">Pinned for quick access</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput placeholder="Search here…" />
            <Select placeholder="Company Type" options={['Bond', 'Client', 'Industry', 'Registered Agent', 'Vendor', 'Warehouse']} />
            <Select placeholder="Alerts" options={['Pending', 'Work Stop', 'No Alert']} />
            <Select placeholder="Status" options={['Active', 'Inactive', 'Archived']} />
            <ColumnSettingsDropdown {...favCols.dropdownProps} buttonClassName={favColBtn} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pl-4 pr-0 py-3 w-7" />
                {favCols.show('name') && <th className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wide pl-2 pr-5 text-left">Company Name</th>}
                {favCols.show('type') && <th className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wide px-5 text-left">Company Type</th>}
                {favCols.show('dba') && <th className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wide px-5 text-left">DBA</th>}
                {favCols.show('status') && <th className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wide px-5 text-center">Status</th>}
                {favCols.show('alerts') && <th className="text-xs font-semibold text-slate-500 py-3 uppercase tracking-wide px-5 text-center">Alerts</th>}
              </tr>
            </thead>
            <tbody>
              {favorites.map((c, i) => (
                <tr
                  key={i}
                  className={`transition-colors ${
                    c.alertStatus === 'Work Stop'
                      ? 'bg-danger-light hover:bg-danger-lighter text-danger'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="pl-4 pr-0 py-3.5">
                    <button
                      onClick={() => toggleStar(i)}
                      className="group flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#e1c16e]/20 transition-colors"
                      title={c.starred ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill={c.starred ? '#e1c16e' : 'none'} stroke={c.starred ? '#e1c16e' : (c.alertStatus === 'Work Stop' ? '#bb5757' : '#94a3b8')} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="transition-all group-hover:scale-110">
                        <path d="M7.5 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
                      </svg>
                    </button>
                  </td>
                  {favCols.show('name') && (
                    <td className="pl-2 pr-5 py-3.5">
                      <span className={`text-sm font-medium cursor-pointer ${c.alertStatus === 'Work Stop' ? 'text-danger hover:text-danger-hover' : 'text-[#12518c] hover:text-[#0e4173]'}`}>{c.name}</span>
                    </td>
                  )}
                  {favCols.show('type') && <td className={`px-5 py-3.5 text-sm ${c.alertStatus === 'Work Stop' ? 'text-danger' : 'text-slate-600'}`}>{c.type}</td>}
                  {favCols.show('dba') && <td className={`px-5 py-3.5 text-sm ${c.alertStatus === 'Work Stop' ? 'text-danger' : 'text-slate-600'}`}>{c.dba}</td>}
                  {favCols.show('status') && (
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={c.status} alert={c.alertStatus === 'Work Stop'} />
                    </td>
                  )}
                  {favCols.show('alerts') && (
                    <td className="px-5 py-3.5">
                      <div className="flex justify-center">
                        <AlertDropdown
                          status={c.alertStatus}
                          onChange={(s) => setAlertStatus(i, s)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Renewals Due in the Next 30 Days</h2>
            <p className="text-xs text-slate-500 mt-0.5">{RENEWALS.length} items requiring action</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchInput placeholder="Search here…" />
            <Select placeholder="Company" />
            <Select placeholder="License Type" />
            <Select placeholder="Function" />
            <ColumnSettingsDropdown {...renewalCols.dropdownProps} buttonClassName={favColBtn} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {renewalCols.show('name') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">Company Name</th>}
                {renewalCols.show('state') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">State</th>}
                {renewalCols.show('function') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">Function</th>}
                {renewalCols.show('item') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">Item Name</th>}
                {renewalCols.show('license') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">License/Permit #</th>}
                {renewalCols.show('renewalDate') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">Renewal Due Date</th>}
                {renewalCols.show('expiryDate') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">Expiration Date</th>}
                {renewalCols.show('actionDays') && <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wide whitespace-nowrap">Action (Days)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RENEWALS.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  {renewalCols.show('name') && (
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-[#12518c] hover:text-[#0e4173] cursor-pointer">{r.name}</span>
                    </td>
                  )}
                  {renewalCols.show('state') && (
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{r.state}</span>
                    </td>
                  )}
                  {renewalCols.show('function') && <td className="px-5 py-3.5 text-sm text-slate-600">{r.function}</td>}
                  {renewalCols.show('item') && <td className="px-5 py-3.5 text-sm text-slate-500">{r.item || '—'}</td>}
                  {renewalCols.show('license') && <td className="px-5 py-3.5 text-sm text-slate-700 font-mono">{r.license}</td>}
                  {renewalCols.show('renewalDate') && <td className="px-5 py-3.5 text-sm text-slate-600">{r.renewalDate}</td>}
                  {renewalCols.show('expiryDate') && <td className="px-5 py-3.5 text-sm text-slate-500">{r.expiryDate || '—'}</td>}
                  {renewalCols.show('actionDays') && (
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-danger-light text-danger border border-danger-border">
                        <span className="w-1.5 h-1.5 rounded-full bg-danger-muted inline-block" />
                        {r.actionDays}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end px-5 py-3.5 border-t border-slate-100">
          <button className="text-sm font-medium text-[#12518c] hover:text-[#0e4173] transition-colors flex items-center gap-1">
            View All
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7h10M8 3l4 4-4 4" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}

type ApprovalContext = {
  company: string
  field: string
  detail?: string
  newValue?: string
  previousData?: string
  updatedData?: string
}

function ApprovalNotesModal({
  context,
  notes,
  onNotesChange,
  onClose,
  onSubmit,
  submitting,
  title = 'Approval Notes',
  description = 'Add optional notes before approving this change.',
  submitLabel = 'Submit',
}: {
  context: ApprovalContext
  notes: string
  onNotesChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
  submitting: boolean
  title?: string
  description?: string
  submitLabel?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose, submitting])

  return (
    <AddressModalShell maxWidth="max-w-xl" onClose={submitting ? () => {} : onClose}>
      <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#12518c]">{title}</h3>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 disabled:opacity-40"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex gap-2 min-w-0">
              <span className="font-semibold text-slate-500 w-16 flex-shrink-0">Company</span>
              <span className="text-slate-700 font-medium truncate">{context.company}</span>
            </div>
            <div className="flex gap-2 min-w-0">
              <span className="font-semibold text-slate-500 w-16 flex-shrink-0">Previous</span>
              <span className="text-slate-700 truncate">{context.previousData || context.detail || '—'}</span>
            </div>
            <div className="flex gap-2 min-w-0">
              <span className="font-semibold text-slate-500 w-16 flex-shrink-0">Field</span>
              <span className="text-slate-700 truncate">{context.field}</span>
            </div>
            <div className="flex gap-2 min-w-0">
              <span className="font-semibold text-slate-500 w-16 flex-shrink-0">Updated</span>
              <span className="text-slate-700 font-medium truncate">{context.updatedData || context.newValue || '—'}</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="approval-notes" className="block text-sm font-semibold text-slate-700 mb-2">
            Notes
          </label>
          <textarea
            ref={textareaRef}
            id="approval-notes"
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            disabled={submitting}
            rows={4}
            placeholder="Add approval notes (optional)…"
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 resize-none transition-all focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] disabled:bg-slate-50"
          />
          <p className="text-[11px] text-slate-400 mt-1.5">
            {notes.length}/500 characters
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="min-w-[96px] px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide text-white bg-slate-500 hover:bg-slate-600 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className={`min-w-[96px] px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide text-white transition-colors disabled:opacity-70 flex items-center justify-center gap-2 ${
            submitLabel === 'Deny' || submitLabel === 'Revert'
              ? 'bg-danger hover:bg-danger-hover'
              : 'bg-[#12518c] hover:bg-[#0e4173]'
          }`}
        >
          {submitting && (
            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {submitting ? 'Submitting…' : submitLabel}
        </button>
      </div>
    </AddressModalShell>
  )
}

function NotesPreviewModal({
  company,
  field,
  notes,
  onClose,
}: {
  company: string
  field: string
  notes: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <AddressModalShell maxWidth="max-w-md" onClose={onClose}>
      <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#12518c]">Notes Preview</h3>
          <p className="text-xs text-slate-500 mt-1 truncate">{company} · {field}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{notes || 'No notes provided.'}</p>
      </div>
      <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/40">
        <button
          type="button"
          onClick={onClose}
          className="min-w-[96px] px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
        >
          Close
        </button>
      </div>
    </AddressModalShell>
  )
}

function CellarToast({ message }: { message: string }) {
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[10000] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg animate-[fadeIn_0.2s_ease-out]">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 8.5l3 3 6-6" />
      </svg>
      {message}
    </div>,
    document.body
  )
}

function CellarPage({
  activeTab,
  onTabChange,
  actionItems,
  onActionItemsChange,
}: {
  activeTab: (typeof CELLAR_TABS)[number]
  onTabChange: (tab: (typeof CELLAR_TABS)[number]) => void
  actionItems: ActionItemRow[]
  onActionItemsChange: (items: ActionItemRow[] | ((prev: ActionItemRow[]) => ActionItemRow[])) => void
}) {
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortDesc, setSortDesc] = useState(true)
  const [pendingRows, setPendingRows] = useState(PENDING_CHANGES)
  const [approvalContext, setApprovalContext] = useState<ApprovalContext | null>(null)
  const [approvalRowId, setApprovalRowId] = useState<number | null>(null)
  const [approvalSource, setApprovalSource] = useState<'action' | 'pending' | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [submittingApproval, setSubmittingApproval] = useState(false)
  const [denyTarget, setDenyTarget] = useState<ActionItemRow | null>(null)
  const [denyNotes, setDenyNotes] = useState('')
  const [submittingDeny, setSubmittingDeny] = useState(false)
  const [notesPreview, setNotesPreview] = useState<{ company: string; field: string; notes: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [finalDecisions, setFinalDecisions] = useState(FINAL_DECISIONS)
  const [fieldFilter, setFieldFilter] = useState('')
  const [requestedByFilter, setRequestedByFilter] = useState('')
  const [specialistFilter, setSpecialistFilter] = useState('')
  const [revertTarget, setRevertTarget] = useState<FinalDecisionRow | null>(null)
  const [revertNotes, setRevertNotes] = useState('')
  const [submittingRevert, setSubmittingRevert] = useState(false)

  const actionItemCols = useTableColumns([
    { key: 'company', label: 'Company/Contact Name' },
    { key: 'recordName', label: 'Record Name' },
    { key: 'requestDate', label: 'Request Date' },
    { key: 'field', label: 'Field' },
    { key: 'previousData', label: 'Previous Data' },
    { key: 'updatedData', label: 'Updated Data' },
    { key: 'notes', label: 'Notes' },
    { key: 'requestedBy', label: 'Requested By' },
  ])
  const pendingCols = useTableColumns([
    { key: 'company', label: 'Company' },
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'detail', label: 'Detail' },
    { key: 'field', label: 'Field' },
    { key: 'newValue', label: 'New Value' },
    { key: 'status', label: 'Status' },
    { key: 'requestedBy', label: 'Requested By' },
  ])
  const finalCols = useTableColumns([
    { key: 'company', label: 'Company/Contact Name' },
    { key: 'recordName', label: 'Record Name' },
    { key: 'decisionDate', label: 'Decision Date' },
    { key: 'field', label: 'Field' },
    { key: 'previousData', label: 'Previous Data' },
    { key: 'updatedData', label: 'Updated Data' },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'specialist', label: 'Specialist' },
    { key: 'status', label: 'Status' },
  ])
  const cellarColBtn = 'p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 transition-all duration-200'

  const PAGE_SIZE = 10

  const filteredActionItems = actionItems
    .filter(row => {
      const q = search.toLowerCase()
      return (
        !q ||
        row.companyContactName.toLowerCase().includes(q) ||
        row.recordName.toLowerCase().includes(q) ||
        row.field.toLowerCase().includes(q) ||
        row.previousData.toLowerCase().includes(q) ||
        row.updatedData.toLowerCase().includes(q) ||
        row.requestedBy.toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      const cmp = a.requestDate.localeCompare(b.requestDate)
      return sortDesc ? -cmp : cmp
    })

  const filteredPending = pendingRows.filter(row => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      row.company.toLowerCase().includes(q) ||
      row.field.toLowerCase().includes(q) ||
      row.detail.toLowerCase().includes(q)
    return (
      matchesSearch &&
      (!requestedByFilter || row.initials === requestedByFilter) &&
      (!specialistFilter || row.badge === specialistFilter)
    )
  })

  const pendingRequestedByOptions = [...new Set(pendingRows.map(r => r.initials))].sort()
  const pendingSpecialistOptions = [...new Set(pendingRows.map(r => r.badge))].sort()
  const pendingFiltersActive = !!(search || requestedByFilter || specialistFilter)

  const clearPendingFilters = () => {
    setSearch('')
    setRequestedByFilter('')
    setSpecialistFilter('')
    setPage(1)
  }

  const filteredFinalDecisions = finalDecisions.filter(row => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      row.companyContactName.toLowerCase().includes(q) ||
      row.recordName.toLowerCase().includes(q) ||
      row.field.toLowerCase().includes(q) ||
      row.previousData.toLowerCase().includes(q) ||
      row.updatedData.toLowerCase().includes(q) ||
      row.requestedBy.toLowerCase().includes(q) ||
      row.specialist.toLowerCase().includes(q)
    return (
      matchesSearch &&
      (!fieldFilter || row.field === fieldFilter) &&
      (!requestedByFilter || row.requestedBy === requestedByFilter) &&
      (!specialistFilter || row.specialist === specialistFilter)
    )
  })

  const finalDecisionPages = Math.max(1, Math.ceil(filteredFinalDecisions.length / PAGE_SIZE))
  const pagedFinalDecisions = filteredFinalDecisions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const finalPageStart = Math.max(1, Math.min(page - 2, finalDecisionPages - 4))
  const finalPageNumbers = Array.from(
    { length: Math.min(5, finalDecisionPages) },
    (_, i) => finalPageStart + i
  ).filter(n => n >= 1 && n <= finalDecisionPages)

  const finalFieldOptions = [...new Set(finalDecisions.map(r => r.field))].sort()
  const finalRequestedByOptions = [...new Set(finalDecisions.map(r => r.requestedBy))].sort()
  const finalSpecialistOptions = [...new Set(finalDecisions.map(r => r.specialist))].sort()
  const finalFiltersActive = !!(search || fieldFilter || requestedByFilter || specialistFilter)

  const currentRows = activeTab === 'My Action Items' ? filteredActionItems : filteredPending
  const allSelected = currentRows.length > 0 && currentRows.every(r => selected.includes(r.id))

  const toggleAll = () => {
    if (allSelected) setSelected([])
    else setSelected(currentRows.map(r => r.id))
  }

  const toggleRow = (id: number) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const handleTabChange = (tab: (typeof CELLAR_TABS)[number]) => {
    onTabChange(tab)
    setSelected([])
    setSearch('')
    setPage(1)
    setFieldFilter('')
    setRequestedByFilter('')
    setSpecialistFilter('')
  }

  const clearFinalFilters = () => {
    setSearch('')
    setFieldFilter('')
    setRequestedByFilter('')
    setSpecialistFilter('')
    setPage(1)
  }

  const openActionApproval = (row: ActionItemRow) => {
    setApprovalContext({
      company: row.companyContactName,
      field: row.field,
      previousData: row.previousData,
      updatedData: row.updatedData,
    })
    setApprovalRowId(row.id)
    setApprovalSource('action')
    setApprovalNotes('')
    setSubmittingApproval(false)
  }

  const openPendingApproval = (row: PendingRow) => {
    setApprovalContext({
      company: row.company,
      field: row.field,
      detail: row.detail,
      newValue: row.newValue,
    })
    setApprovalRowId(row.id)
    setApprovalSource('pending')
    setApprovalNotes('')
    setSubmittingApproval(false)
  }

  const closeApprovalModal = () => {
    if (submittingApproval) return
    setApprovalContext(null)
    setApprovalRowId(null)
    setApprovalSource(null)
    setApprovalNotes('')
  }

  const handleApprovalSubmit = () => {
    if (!approvalContext || approvalRowId == null || !approvalSource) return
    setSubmittingApproval(true)
    setTimeout(() => {
      if (approvalSource === 'action') {
        onActionItemsChange(prev => prev.filter(r => r.id !== approvalRowId))
      } else {
        setPendingRows(prev => prev.filter(r => r.id !== approvalRowId))
      }
      setSelected(prev => prev.filter(id => id !== approvalRowId))
      setToast(`"${approvalContext.field}" change approved for ${approvalContext.company}`)
      closeApprovalModal()
      setSubmittingApproval(false)
      setTimeout(() => setToast(null), 3500)
    }, 700)
  }

  const closeDenyModal = () => {
    if (submittingDeny) return
    setDenyTarget(null)
    setDenyNotes('')
  }

  const handleDenySubmit = () => {
    if (!denyTarget) return
    setSubmittingDeny(true)
    setTimeout(() => {
      onActionItemsChange(prev => prev.filter(r => r.id !== denyTarget.id))
      setSelected(prev => prev.filter(id => id !== denyTarget.id))
      setToast(`"${denyTarget.field}" change denied for ${denyTarget.companyContactName}`)
      closeDenyModal()
      setSubmittingDeny(false)
      setTimeout(() => setToast(null), 3500)
    }, 700)
  }

  const closeRevertModal = () => {
    if (submittingRevert) return
    setRevertTarget(null)
    setRevertNotes('')
  }

  const handleRevertSubmit = () => {
    if (!revertTarget) return
    setSubmittingRevert(true)
    setTimeout(() => {
      setFinalDecisions(prev => prev.filter(r => r.id !== revertTarget.id))
      setToast(`"${revertTarget.field}" decision reverted for ${revertTarget.companyContactName}`)
      closeRevertModal()
      setSubmittingRevert(false)
      setTimeout(() => setToast(null), 3500)
    }, 700)
  }

  const tabButtonClass = (tab: (typeof CELLAR_TABS)[number]) =>
    `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-[#12518c] text-white shadow-sm'
        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
    }`

  return (
    <>
      {approvalContext && (
        <ApprovalNotesModal
          context={approvalContext}
          notes={approvalNotes.slice(0, 500)}
          onNotesChange={v => setApprovalNotes(v.slice(0, 500))}
          onClose={closeApprovalModal}
          onSubmit={handleApprovalSubmit}
          submitting={submittingApproval}
        />
      )}

      {denyTarget && (
        <ApprovalNotesModal
          context={{
            company: denyTarget.companyContactName,
            field: denyTarget.field,
            previousData: denyTarget.previousData,
            updatedData: denyTarget.updatedData,
          }}
          title="Deny Change"
          description="Add optional notes before denying this change."
          notes={denyNotes.slice(0, 500)}
          onNotesChange={v => setDenyNotes(v.slice(0, 500))}
          onClose={closeDenyModal}
          onSubmit={handleDenySubmit}
          submitting={submittingDeny}
          submitLabel="Deny"
        />
      )}

      {revertTarget && (
        <ApprovalNotesModal
          context={{
            company: revertTarget.companyContactName,
            field: revertTarget.field,
            previousData: revertTarget.previousData,
            updatedData: revertTarget.updatedData,
          }}
          title="Revert Decision"
          description="Reverting will undo this approved change and restore the previous value. Add optional notes for the audit trail."
          notes={revertNotes.slice(0, 500)}
          onNotesChange={v => setRevertNotes(v.slice(0, 500))}
          onClose={closeRevertModal}
          onSubmit={handleRevertSubmit}
          submitting={submittingRevert}
          submitLabel="Revert"
        />
      )}

      {notesPreview && (
        <NotesPreviewModal
          company={notesPreview.company}
          field={notesPreview.field}
          notes={notesPreview.notes}
          onClose={() => setNotesPreview(null)}
        />
      )}

      {toast && <CellarToast message={toast} />}

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">The Cellar</h1>
      </div>

      <div className="flex items-center gap-2 mb-5">
        {CELLAR_TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={tabButtonClass(tab)}
          >
            {tab}
            {tab === 'My Action Items' && actionItems.length > 0 && (
              <span className={`ml-1.5 inline-flex min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold items-center justify-center ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-danger text-white'
              }`}>
                {actionItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Final Decisions' ? (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AddressSearchInput
                value={search}
                onChange={v => { setSearch(v); setPage(1) }}
              />
              <select
                value={fieldFilter}
                onChange={e => { setFieldFilter(e.target.value); setPage(1) }}
                className={filterSelectClassName(fieldFilter)}
                aria-label="Field"
              >
                <option value="">Field</option>
                {finalFieldOptions.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select
                value={requestedByFilter}
                onChange={e => { setRequestedByFilter(e.target.value); setPage(1) }}
                className={filterSelectClassName(requestedByFilter)}
                aria-label="Requested By"
              >
                <option value="">Requested By</option>
                {finalRequestedByOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={specialistFilter}
                onChange={e => { setSpecialistFilter(e.target.value); setPage(1) }}
                className={filterSelectClassName(specialistFilter)}
                aria-label="Specialist"
              >
                <option value="">Specialist</option>
                {finalSpecialistOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {finalFiltersActive && (
                <button
                  type="button"
                  onClick={clearFinalFilters}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                  Clear
                </button>
              )}
              <ColumnSettingsDropdown {...finalCols.dropdownProps} buttonClassName={cellarColBtn} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60">
                  {finalCols.show('company') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Company/Contact Name</th>}
                  {finalCols.show('recordName') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Record Name</th>}
                  {finalCols.show('decisionDate') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Decision Date</th>}
                  {finalCols.show('field') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Field</th>}
                  {finalCols.show('previousData') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Previous Data</th>}
                  {finalCols.show('updatedData') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Updated Data</th>}
                  {finalCols.show('requestedBy') && <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Requested By</th>}
                  {finalCols.show('specialist') && <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Specialist</th>}
                  {finalCols.show('status') && <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status</th>}
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedFinalDecisions.length === 0 ? (
                  <tr>
                    <td colSpan={finalCols.visibleCount + 1} className="px-4 py-12 text-center text-sm text-slate-400">
                      No final decisions found.
                    </td>
                  </tr>
                ) : (
                  pagedFinalDecisions.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition-colors ${
                        i % 2 ? 'bg-slate-50/40 hover:bg-[#12518c]/5' : 'bg-white hover:bg-[#12518c]/5'
                      }`}
                    >
                      {finalCols.show('company') && (
                        <td className="px-3 py-3">
                          <button type="button" className="text-sm font-medium text-[#12518c] hover:text-[#0e4173] hover:underline text-left whitespace-nowrap">
                            {row.companyContactName}
                          </button>
                        </td>
                      )}
                      {finalCols.show('recordName') && (
                        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap max-w-[180px] truncate" title={row.recordName}>
                          {row.recordName || '—'}
                        </td>
                      )}
                      {finalCols.show('decisionDate') && <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap tabular-nums">{row.decisionDate}</td>}
                      {finalCols.show('field') && <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{row.field}</td>}
                      {finalCols.show('previousData') && (
                        <td className="px-3 py-3 text-sm text-slate-500 whitespace-nowrap max-w-[160px] truncate" title={row.previousData}>
                          {row.previousData || '—'}
                        </td>
                      )}
                      {finalCols.show('updatedData') && (
                        <td className="px-3 py-3 text-sm text-slate-700 font-medium whitespace-nowrap max-w-[160px] truncate" title={row.updatedData}>
                          {row.updatedData || '—'}
                        </td>
                      )}
                      {finalCols.show('requestedBy') && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              {row.requestedBy}
                            </span>
                          </div>
                        </td>
                      )}
                      {finalCols.show('specialist') && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold bg-[#12518c]/10 text-[#12518c]">
                              {row.specialist}
                            </span>
                          </div>
                        </td>
                      )}
                      {finalCols.show('status') && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                row.status === 'Approved'
                                  ? 'bg-[#12518c]/10 text-[#12518c] border border-[#12518c]/20'
                                  : 'bg-danger-light text-danger border border-danger-border'
                              }`}
                              title={`Decision: ${row.status}`}
                            >
                              {row.status}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-3 pr-4">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => { setRevertTarget(row); setRevertNotes('') }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-white bg-[#bb5757] hover:bg-[#a64a4a] transition-colors"
                            title="Revert this decision"
                          >
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 5.5A5 5 0 1 1 2.5 8" />
                              <path d="M3 2.5v3h3" />
                            </svg>
                            Revert
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
            <span className="text-sm text-slate-500">
              Total: <span className="font-semibold text-slate-700">{filteredFinalDecisions.length}</span>
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {finalPageNumbers.map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`min-w-8 h-8 px-2.5 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? 'bg-[#12518c] text-white'
                      : 'border border-slate-200 text-slate-600 hover:bg-white'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-40"
                disabled={page >= finalDecisionPages}
                onClick={() => setPage(p => Math.min(finalDecisionPages, p + 1))}
                aria-label="Next page"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      ) : activeTab === 'My Action Items' ? (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AddressSearchInput
                value={search}
                onChange={v => { setSearch(v); setPage(1) }}
              />
              <ColumnSettingsDropdown {...actionItemCols.dropdownProps} buttonClassName={cellarColBtn} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-2.5 w-10">
                    <span className="sr-only">Select All</span>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows"
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#12518c] cursor-pointer"
                    />
                  </th>
                  {actionItemCols.show('company') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Company/Contact Name</th>}
                  {actionItemCols.show('recordName') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Record Name</th>}
                  {actionItemCols.show('requestDate') && (
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSortDesc(d => !d)}
                        className="inline-flex items-center gap-1 hover:text-[#12518c] transition-colors"
                      >
                        Request Date
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={sortDesc ? '' : 'rotate-180'}>
                          <path d="M2.5 3.5L5 6l2.5-2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </th>
                  )}
                  {actionItemCols.show('field') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Field</th>}
                  {actionItemCols.show('previousData') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Previous Data</th>}
                  {actionItemCols.show('updatedData') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Updated Data</th>}
                  {actionItemCols.show('notes') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Notes</th>}
                  {actionItemCols.show('requestedBy') && <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Requested By</th>}
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap w-[150px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActionItems.length === 0 ? (
                  <tr>
                    <td colSpan={actionItemCols.visibleCount + 2} className="px-4 py-12 text-center text-sm text-slate-400">No action items found.</td>
                  </tr>
                ) : (
                  filteredActionItems.map((row, i) => {
                    const isSelected = selected.includes(row.id)
                    return (
                      <tr
                        key={row.id}
                        className={`border-b border-slate-100 transition-colors ${
                          isSelected
                            ? 'bg-[#12518c]/8'
                            : i % 2
                              ? 'bg-slate-50/40 hover:bg-[#12518c]/5'
                              : 'bg-white hover:bg-[#12518c]/5'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-[#12518c] cursor-pointer"
                          />
                        </td>
                        {actionItemCols.show('company') && (
                          <td className="px-3 py-3">
                            <button type="button" className="text-sm font-medium text-[#12518c] hover:text-[#0e4173] hover:underline text-left whitespace-nowrap">
                              {row.companyContactName}
                            </button>
                          </td>
                        )}
                        {actionItemCols.show('recordName') && <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{row.recordName || '—'}</td>}
                        {actionItemCols.show('requestDate') && <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap tabular-nums">{row.requestDate}</td>}
                        {actionItemCols.show('field') && <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{row.field}</td>}
                        {actionItemCols.show('previousData') && <td className="px-3 py-3 text-sm text-slate-500 whitespace-nowrap">{row.previousData || '—'}</td>}
                        {actionItemCols.show('updatedData') && <td className="px-3 py-3 text-sm text-slate-700 font-medium whitespace-nowrap">{row.updatedData || '—'}</td>}
                        {actionItemCols.show('notes') && (
                          <td className="px-3 py-3">
                            {row.notes ? (
                              <button
                                type="button"
                                onClick={() => setNotesPreview({ company: row.companyContactName, field: row.field, notes: row.notes })}
                                className="text-sm font-medium text-[#12518c] hover:text-[#0e4173] hover:underline"
                              >
                                Preview
                              </button>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </td>
                        )}
                        {actionItemCols.show('requestedBy') && (
                          <td className="px-3 py-3">
                            <div className="flex items-center justify-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                {row.requestedBy}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="px-3 py-3 pr-4">
                          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openActionApproval(row)}
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => { setDenyTarget(row); setDenyNotes('') }}
                              className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-danger hover:bg-danger-hover transition-colors"
                            >
                              Deny
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <AddressTableFooter total={filteredActionItems.length} page={page} onPageChange={setPage} />
        </section>
      ) : (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AddressSearchInput
                value={search}
                onChange={v => { setSearch(v); setPage(1) }}
              />
              <select
                value={requestedByFilter}
                onChange={e => { setRequestedByFilter(e.target.value); setPage(1) }}
                className={filterSelectClassName(requestedByFilter)}
                aria-label="Requested By"
              >
                <option value="">Requested By</option>
                {pendingRequestedByOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select
                value={specialistFilter}
                onChange={e => { setSpecialistFilter(e.target.value); setPage(1) }}
                className={filterSelectClassName(specialistFilter)}
                aria-label="Specialist"
              >
                <option value="">Specialist</option>
                {pendingSpecialistOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {pendingFiltersActive && (
                <button
                  type="button"
                  onClick={clearPendingFilters}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                  Clear
                </button>
              )}
              <ColumnSettingsDropdown {...pendingCols.dropdownProps} buttonClassName={cellarColBtn} />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-2.5 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#12518c] cursor-pointer"
                    />
                  </th>
                  {pendingCols.show('company') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Company</th>}
                  {pendingCols.show('timestamp') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Timestamp</th>}
                  {pendingCols.show('detail') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Detail</th>}
                  {pendingCols.show('field') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Field</th>}
                  {pendingCols.show('newValue') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">New Value</th>}
                  {pendingCols.show('status') && <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>}
                  {pendingCols.show('requestedBy') && <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Requested By</th>}
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={pendingCols.visibleCount + 2} className="px-4 py-12 text-center text-sm text-slate-400">No pending changes found.</td>
                  </tr>
                ) : (
                  filteredPending.map((row, i) => (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition-colors ${
                        selected.includes(row.id)
                          ? 'bg-[#12518c]/8'
                          : i % 2
                            ? 'bg-slate-50/40 hover:bg-[#12518c]/5'
                            : 'bg-white hover:bg-[#12518c]/5'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-[#12518c] cursor-pointer"
                        />
                      </td>
                      {pendingCols.show('company') && (
                        <td className="px-3 py-3">
                          <button type="button" className="text-sm font-medium text-[#12518c] hover:text-[#0e4173] hover:underline text-left whitespace-nowrap">
                            {row.company}
                          </button>
                        </td>
                      )}
                      {pendingCols.show('timestamp') && <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap tabular-nums">{row.timestamp}</td>}
                      {pendingCols.show('detail') && (
                        <td className="px-3 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={row.detail}>
                          {row.detail}
                        </td>
                      )}
                      {pendingCols.show('field') && <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{row.field}</td>}
                      {pendingCols.show('newValue') && (
                        <td className="px-3 py-3 text-sm text-slate-600 max-w-[180px] truncate" title={row.newValue}>
                          {row.newValue || '—'}
                        </td>
                      )}
                      {pendingCols.show('status') && (
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e1c16e]/15 text-[#8a6d24] border border-[#e1c16e]/40">
                            Pending
                          </span>
                        </td>
                      )}
                      {pendingCols.show('requestedBy') && (
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              {row.initials}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-3 pr-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setNotesPreview({ company: row.company, field: row.field, notes: row.notes })}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#12518c] transition-colors"
                            title="View notes"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 2h5l3 3v8.5a1.5 1.5 0 0 1-1.5 1.5h-6.5A1.5 1.5 0 0 1 2.5 13.5v-10A1.5 1.5 0 0 1 4 2z" />
                              <path d="M9 2v3h3M5.5 8h5M5.5 10.5h5M5.5 13h3" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => openPendingApproval(row)}
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
                          >
                            Approve
                          </button>
                          <button type="button" className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-danger hover:bg-danger-hover transition-colors">
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AddressTableFooter total={filteredPending.length} page={page} onPageChange={setPage} />
        </section>
      )}
    </>
  )
}

function PeoplePage({
  people,
  onPeopleChange,
  onSelectPerson,
  onAddPerson,
}: {
  people: PersonRow[]
  onPeopleChange: (people: PersonRow[] | ((prev: PersonRow[]) => PersonRow[])) => void
  onSelectPerson: (person: PersonRow) => void
  onAddPerson: () => void
}) {
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)

  const peopleCols = useTableColumns([
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'company', label: 'Company/Agency Name' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'alerts', label: 'Alerts' },
  ])
  const peopleColBtn = 'p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 transition-all duration-200'

  const filtered = people.filter(p => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q)
    return (
      (!typeFilter || p.type === typeFilter) &&
      matchesSearch &&
      (!categoryFilter || p.category === categoryFilter)
    )
  })

  const filtersActive = !!(typeFilter || search || categoryFilter)

  const clearFilters = () => {
    setTypeFilter('')
    setSearch('')
    setCategoryFilter('')
    setPage(1)
  }

  const setAlertStatus = (id: number, status: AlertStatus) => {
    onPeopleChange(prev => prev.map(p => (p.id === id ? { ...p, alert: status } : p)))
  }

  const exportPeople = () => {
    const rows = [
      ['Name', 'Email', 'Company/Agency Name', 'Type', 'Category'],
      ...filtered.map(p => [p.name, p.email, p.company, p.type, p.category]),
    ]
    const csv = rows.map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'people.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">People</h1>
          <p className="mt-1 text-sm text-slate-500">Manage contacts across clients, agencies, vendors, and industry partners.</p>
        </div>
        <button
          type="button"
          onClick={onAddPerson}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 2.5v7M2.5 6h7" />
          </svg>
          Add New
        </button>
      </div>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5" cy="5" r="3.5" />
                <path d="M8 8l2.5 2.5" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search by name, email, or company/agency"
                className="h-9 w-72 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c]"
              />
            </div>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1) }}
              className={filterSelectClassName(typeFilter)}
            >
              <option value="">Type</option>
              <option value="Client">Client</option>
              <option value="Agency">Agency</option>
              <option value="Vendor">Vendor</option>
              <option value="Industry">Industry</option>
            </select>
            <select
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
              className={filterSelectClassName(categoryFilter)}
            >
              <option value="">Category</option>
              <option value="Individual">Individual</option>
              <option value="Shared Email">Shared Email</option>
            </select>
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
                Clear
              </button>
            )}
            <ColumnSettingsDropdown {...peopleCols.dropdownProps} buttonClassName={peopleColBtn} />
            <button
              type="button"
              onClick={exportPeople}
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
            >
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {peopleCols.show('name') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Name</th>}
                {peopleCols.show('email') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Email</th>}
                {peopleCols.show('company') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Company/Agency Name</th>}
                {peopleCols.show('type') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">Type</th>}
                {peopleCols.show('category') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Category</th>}
                {peopleCols.show('alerts') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">Alerts</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={peopleCols.visibleCount} className="px-4 py-12 text-center text-sm text-slate-400">No people found.</td>
                </tr>
              ) : (
                filtered.map((person, i) => (
                  <tr
                    key={person.id}
                    className={`border-b border-slate-100 transition-colors ${
                      person.alert === 'Work Stop'
                        ? 'bg-danger-light hover:bg-danger-lighter'
                        : i % 2
                          ? 'bg-slate-50/40 hover:bg-[#12518c]/5'
                          : 'bg-white hover:bg-[#12518c]/5'
                    }`}
                  >
                    {peopleCols.show('name') && (
                      <td className={`px-4 py-3 text-sm font-medium ${person.alert === 'Work Stop' ? 'text-danger' : 'text-slate-800'}`}>
                        <button
                          type="button"
                          onClick={() => onSelectPerson(person)}
                          className={`text-left hover:underline ${person.alert === 'Work Stop' ? 'text-danger' : 'text-[#12518c]'}`}
                        >
                          {person.name}
                        </button>
                      </td>
                    )}
                    {peopleCols.show('email') && (
                      <td className="px-4 py-3 text-sm">
                        <a href={`mailto:${person.email}`} className={`${person.alert === 'Work Stop' ? 'text-danger' : 'text-[#12518c]'} hover:underline`}>{person.email}</a>
                      </td>
                    )}
                    {peopleCols.show('company') && <td className={`px-4 py-3 text-sm ${person.alert === 'Work Stop' ? 'text-danger' : 'text-slate-600'}`}>{person.company}</td>}
                    {peopleCols.show('type') && (
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          person.type === 'Client' ? 'bg-sky-50 text-sky-700' :
                          person.type === 'Agency' ? 'bg-violet-50 text-violet-700' :
                          person.type === 'Vendor' ? 'bg-[#e1c16e]/15 text-[#8a6d24]' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {person.type}
                        </span>
                      </td>
                    )}
                    {peopleCols.show('category') && <td className={`px-4 py-3 text-sm ${person.alert === 'Work Stop' ? 'text-danger' : 'text-slate-600'}`}>{person.category}</td>}
                    {peopleCols.show('alerts') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <AlertDropdown
                            status={person.alert}
                            onChange={status => setAlertStatus(person.id, status)}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>
    </>
  )
}

function AddPersonPage({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (person: PersonRow) => void
}) {
  const [openSection, setOpenSection] = useState('General Information')
  const [form, setForm] = useState({
    typeOfContact: '' as '' | PersonRow['type'],
    sal: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    role: '',
    internalRemark: '',
    businessEmail: '',
    workPhone: '',
    extension: '',
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
    businessCountry: 'United States',
    personalEmail: '',
    cellHomePhone: '',
    personalStreet: '',
    personalCity: '',
    personalState: '',
    personalZip: '',
    personalCountry: 'United States',
    notes: '',
  })
  const [errors, setErrors] = useState({ typeOfContact: false, firstName: false, lastName: false })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'typeOfContact' || key === 'firstName' || key === 'lastName') {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const submit = () => {
    const next = {
      typeOfContact: !form.typeOfContact,
      firstName: !form.firstName.trim(),
      lastName: !form.lastName.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      setOpenSection('General Information')
      return
    }

    const name = [form.sal, form.firstName.trim(), form.middleName.trim(), form.lastName.trim(), form.suffix]
      .filter(Boolean)
      .join(' ')
    const email = form.businessEmail.trim() || form.personalEmail.trim() || `${form.firstName.toLowerCase()}@example.com`

    onSave({
      id: Date.now(),
      name,
      email,
      company: form.role.trim() || '—',
      type: form.typeOfContact as PersonRow['type'],
      category: 'Individual',
      alert: null,
    })
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">Add New Person</h1>
          <p className="mt-1 text-sm text-slate-500">Enter contact details, business and personal address information.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 space-y-3">
          <DetailSection
            title="General Information"
            open={openSection === 'General Information'}
            onToggle={() => setOpenSection('General Information')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-4">
              <div>
                <DetailSelect
                  label="Type of Contact *"
                  value={form.typeOfContact}
                  onChange={v => set('typeOfContact', v as PersonRow['type'])}
                  editing
                  options={['Client', 'Agency', 'Vendor', 'Industry']}
                  placeholder="Select…"
                />
                {errors.typeOfContact && <p className="mt-1 text-[11px] text-[#bb5757]">Type of contact is required.</p>}
              </div>
              <DetailSelect label="Sal" value={form.sal} onChange={v => set('sal', v)} editing options={['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']} placeholder="Select…" />
              <div>
                <DetailField label="First Name *" value={form.firstName} onChange={v => set('firstName', v)} editing />
                {errors.firstName && <p className="mt-1 text-[11px] text-[#bb5757]">First name is required.</p>}
              </div>
              <DetailField label="Middle Name" value={form.middleName} onChange={v => set('middleName', v)} editing />
              <div>
                <DetailField label="Last Name *" value={form.lastName} onChange={v => set('lastName', v)} editing />
                {errors.lastName && <p className="mt-1 text-[11px] text-[#bb5757]">Last name is required.</p>}
              </div>
              <DetailSelect label="Suffix" value={form.suffix} onChange={v => set('suffix', v)} editing options={['Jr', 'Sr', 'II', 'III', 'IV']} placeholder="Select…" />
              <DetailField label="Role" value={form.role} onChange={v => set('role', v)} editing />
              <DetailField label="Internal Remark" value={form.internalRemark} onChange={v => set('internalRemark', v)} editing />
            </div>
          </DetailSection>

          <DetailSection
            title="Business Address"
            open={openSection === 'Business Address'}
            onToggle={() => setOpenSection('Business Address')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
              <DetailField label="Email" value={form.businessEmail} onChange={v => set('businessEmail', v)} editing />
              <DetailField label="Work/Office Phone" value={form.workPhone} onChange={v => set('workPhone', v)} editing />
              <DetailField label="Extension" value={form.extension} onChange={v => set('extension', v)} editing />
            </div>
            <div className="mt-4">
              <DetailField label="Street" value={form.businessStreet} onChange={v => set('businessStreet', v)} editing />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 mt-4">
              <DetailField label="City" value={form.businessCity} onChange={v => set('businessCity', v)} editing />
              <DetailSelect label="State" value={form.businessState} onChange={v => set('businessState', v)} editing options={US_STATES} placeholder="Select…" />
              <DetailField label="Zip Code" value={form.businessZip} onChange={v => set('businessZip', v)} editing />
              <DetailSelect label="Country" value={form.businessCountry} onChange={v => set('businessCountry', v)} editing options={['United States', 'Canada', 'Mexico']} />
            </div>
          </DetailSection>

          <DetailSection
            title="Personal Address"
            open={openSection === 'Personal Address'}
            onToggle={() => setOpenSection('Personal Address')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <DetailField label="Email" value={form.personalEmail} onChange={v => set('personalEmail', v)} editing />
              <DetailField label="Cell/Home Phone" value={form.cellHomePhone} onChange={v => set('cellHomePhone', v)} editing />
            </div>
            <div className="mt-4">
              <DetailField label="Street" value={form.personalStreet} onChange={v => set('personalStreet', v)} editing />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 mt-4">
              <DetailField label="City" value={form.personalCity} onChange={v => set('personalCity', v)} editing />
              <DetailSelect label="State" value={form.personalState} onChange={v => set('personalState', v)} editing options={US_STATES} placeholder="Select…" />
              <DetailField label="Zip Code" value={form.personalZip} onChange={v => set('personalZip', v)} editing />
              <DetailSelect label="Country" value={form.personalCountry} onChange={v => set('personalCountry', v)} editing options={['United States', 'Canada', 'Mexico']} />
            </div>
            <label className="block min-w-0 mt-4">
              <span className="block text-[11px] font-medium text-slate-500 mb-1.5 leading-tight">Note</span>
              <div className="rounded-lg border border-slate-300 overflow-hidden bg-white">
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/80">
                  {['B', 'I', 'U', 'S', '❝', '•', '1.', '≡', '🔗', '🖼', '✕'].map(btn => (
                    <button key={btn} type="button" className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-500 hover:bg-white">
                      {btn}
                    </button>
                  ))}
                </div>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  rows={5}
                  placeholder=""
                  className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y min-h-[120px] bg-transparent"
                />
              </div>
            </label>
          </DetailSection>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function PersonDetailPage({
  person,
  tab,
  onTabChange,
  onBack,
  onDelete,
  onAlertChange,
}: {
  person: PersonRow
  tab: (typeof PERSON_DETAIL_TABS)[number]
  onTabChange: (tab: (typeof PERSON_DETAIL_TABS)[number]) => void
  onBack: () => void
  onDelete: () => void
  onAlertChange: (status: AlertStatus) => void
}) {
  const [pastOpen, setPastOpen] = useState(true)
  const [alertStatus, setAlertStatus] = useState<AlertStatus>(person.alert)
  const [detailEditRequest, setDetailEditRequest] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const workStopActive = alertStatus === 'Work Stop'
  const personId = 2000 + person.id
  const role = person.category === 'Shared Email' ? 'Shared Contact' : 'Client Contact'

  const currentAssociations = [
    {
      company: person.company,
      companyStatus: person.alert === 'Work Stop' ? 'Inactive' : 'Active',
      type: person.type === 'Client' ? 'Contact' : person.type,
      workPhone: '',
      email: person.email,
    },
  ]
  const pastAssociations: typeof currentAssociations = []

  const applyAlert = (status: AlertStatus) => {
    setAlertStatus(status)
    onAlertChange(status)
  }

  return (
    <div className="space-y-5 animate-[fadeIn_0.25s_ease-out]">
      <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm ${workStopActive ? 'border-danger-border' : 'border-slate-200'}`}>
        {workStopActive && (
          <div className="px-5 py-2 bg-[#bb5757] text-white text-xs font-semibold flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5.5 5.5l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Work Stop is active — compliance work is paused for this person
          </div>
        )}
        <div className={`px-5 py-5 ${workStopActive ? 'bg-danger-light/40' : ''}`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <button
                type="button"
                onClick={onBack}
                className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#12518c] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3L5 7l4 4" />
                </svg>
                People
              </button>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className={`text-xl sm:text-2xl font-bold truncate ${workStopActive ? 'text-danger' : 'text-slate-900'}`}>
                  {person.name}
                </h1>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                  workStopActive ? 'bg-danger-lighter text-danger-hover' : 'bg-slate-100 text-slate-600'
                }`}>
                  {role}
                </span>
                <AlertDropdown status={alertStatus} onChange={applyAlert} />
              </div>
              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${workStopActive ? 'text-danger' : 'text-slate-600'}`}>
                <span><span className={workStopActive ? 'text-danger-muted' : 'text-slate-400'}>Person ID</span> {personId}</span>
                <span className={workStopActive ? 'text-danger/40' : 'text-slate-300'}>·</span>
                <span><span className={workStopActive ? 'text-danger-muted' : 'text-slate-400'}>Type</span> {person.type}</span>
                <span className={workStopActive ? 'text-danger/40' : 'text-slate-300'}>·</span>
                <span><span className={workStopActive ? 'text-danger-muted' : 'text-slate-400'}>Category</span> {person.category}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  onTabChange('Detail')
                  setDetailEditRequest(n => n + 1)
                }}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                title="Edit"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-[#bb5757] hover:bg-danger-light transition-colors"
                title="Delete"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <nav
        aria-label="Person sections"
        className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm"
      >
        <div className="overflow-x-auto px-2 sm:px-3 border-b border-slate-100">
          <div className="flex items-stretch gap-0 min-w-max" role="tablist">
            {PERSON_DETAIL_TABS.map(t => {
              const isActive = tab === t
              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(t)}
                  className={`relative px-3.5 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#12518c]' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                  <span
                    className={`absolute left-2 right-2 bottom-0 h-0.5 rounded-full transition-opacity ${
                      isActive ? 'bg-[#12518c] opacity-100' : 'bg-transparent opacity-0'
                    }`}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {tab === 'Detail' ? (
        <PersonDetailFieldsPage person={person} role={role} editRequest={detailEditRequest} />
      ) : tab === 'Business Addresses' ? (
        <PersonAddressesPage />
      ) : tab === 'Change Log' ? (
        <PersonChangeLogPage />
      ) : tab === 'Notes' ? (
        <PersonNotesPage />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5 items-start">
          <section className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${workStopActive ? 'border-danger-border' : 'border-slate-200'}`}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#12518c]">General Information</h2>
              <div className="flex items-center gap-1">
                <button type="button" className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-4 py-4 space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Name</p>
                <p className={`mt-0.5 text-sm font-semibold ${workStopActive ? 'text-danger' : 'text-slate-800'}`}>{person.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Role</p>
                <p className="mt-0.5 text-sm text-slate-700">{role}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Email</p>
                <a href={`mailto:${person.email}`} className="mt-0.5 text-sm text-[#12518c] hover:underline inline-block">{person.email}</a>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Type</p>
                <p className="mt-0.5 text-sm text-slate-700">{person.type}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
                <p className="mt-0.5 text-sm text-slate-700">{person.category}</p>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <PersonAssociationCard title="Current Company Associations" rows={currentAssociations} />
            <PersonAssociationCard
              title="Past Company Associations"
              rows={pastAssociations}
              collapsible
              open={pastOpen}
              onToggle={() => setPastOpen(o => !o)}
            />
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <AddressDeleteConfirmModal
          title="Delete person"
          locationName={person.name}
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false)
            onDelete()
          }}
        />
      )}
    </div>
  )
}

function PersonAssociationCard({
  title,
  rows,
  collapsible,
  open = true,
  onToggle,
}: {
  title: string
  rows: { company: string; companyStatus: string; type: string; workPhone: string; email: string }[]
  collapsible?: boolean
  open?: boolean
  onToggle?: () => void
}) {
  const cols = useTableColumns([
    { key: 'company', label: 'Company' },
    { key: 'companyStatus', label: 'Company Status' },
    { key: 'type', label: 'Type' },
    { key: 'workPhone', label: 'Work Phone' },
    { key: 'email', label: 'Email' },
  ])

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {collapsible && (
            <button type="button" onClick={onToggle} className="p-1 rounded-md text-slate-400 hover:bg-slate-100" aria-label="Toggle">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" className={open ? '' : 'rotate-180'}>
                <path d="M2.5 7.5L6 4l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <h2 className="text-sm font-semibold text-[#12518c] truncate">{title}</h2>
          <button type="button" className="p-1 rounded-md text-slate-400 hover:bg-slate-100" title="Info">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 7v4M8 5h.01" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ColumnSettingsDropdown {...cols.dropdownProps} buttonClassName="p-1.5 rounded-md transition-all duration-200" />
      </div>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {cols.show('company') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Company</th>}
                {cols.show('companyStatus') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Company Status</th>}
                {cols.show('type') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-center">Type</th>}
                {cols.show('workPhone') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Work Phone</th>}
                {cols.show('email') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide text-left">Email</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={cols.visibleCount} className="px-4 py-8 text-center text-sm text-slate-400">No record Found!</td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={`${row.company}-${i}`} className={`border-b border-slate-100 ${i % 2 ? 'bg-slate-50/40' : 'bg-white'}`}>
                    {cols.show('company') && (
                      <td className="px-4 py-3 text-sm">
                        <button type="button" className="text-[#12518c] font-medium hover:underline text-left">{row.company}</button>
                      </td>
                    )}
                    {cols.show('companyStatus') && (
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          row.companyStatus === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {row.companyStatus}
                        </span>
                      </td>
                    )}
                    {cols.show('type') && <td className="px-4 py-3 text-center text-sm text-slate-600">{row.type}</td>}
                    {cols.show('workPhone') && <td className="px-4 py-3 text-sm text-slate-600">{row.workPhone || '—'}</td>}
                    {cols.show('email') && (
                      <td className="px-4 py-3 text-sm">
                        <a href={`mailto:${row.email}`} className="text-[#12518c] hover:underline">{row.email}</a>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function PersonDetailFieldsPage({
  person,
  role,
  editRequest = 0,
}: {
  person: PersonRow
  role: string
  editRequest?: number
}) {
  const nameParts = person.name.replace(/^(Mr|Mrs|Ms|Dr|Prof)\s+/i, '').trim().split(/\s+/)
  const inferredFirst = nameParts[0] || ''
  const inferredLast = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
  const inferredMiddle = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : ''
  const preferredMatch = person.name.match(/\(([^)]+)\)/)
  const preferredName = preferredMatch?.[1] || inferredFirst

  const [openSection, setOpenSection] = useState('Basic Information')
  const initialForm = {
    typeOfContact: person.type,
    sal: '',
    firstName: inferredFirst,
    middleName: inferredMiddle,
    lastName: inferredLast,
    suffix: '',
    ttbPq: '',
    nickname: preferredName,
    alias: '',
    internalRemark: '0',
    email: person.email,
    cellHomePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    ssn: '',
    dlNo: '',
    stateIssued: '',
    dob: '',
    placeOfBirth: '',
    usCitizen: false,
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    maritalStatus: '',
    spouseFullName: '',
    marriageDate: '',
    marriageState: '',
    marriageCity: '',
    jobTitle: '',
    company: person.company,
    empCity: '',
    empFrom: '',
    empTo: '',
    currentEmployment: false,
    interestInLicense: '',
    licenseRevoked: '',
    arrested: '',
    notes: person.id === 18 ? 'submits 3T Brand Reg requests' : '',
  }
  const [form, setForm] = useState(initialForm)
  const [formSnapshot, setFormSnapshot] = useState(initialForm)
  const [editing, setEditing] = useState(editRequest > 0)

  useEffect(() => {
    if (editRequest > 0) {
      setFormSnapshot(form)
      setEditing(true)
    }
  }, [editRequest])

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const startEditing = () => {
    setFormSnapshot(form)
    setEditing(true)
  }

  const cancelEditing = () => {
    setForm(formSnapshot)
    setEditing(false)
  }

  const saveEditing = () => {
    setFormSnapshot(form)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4.5h12M2 8h12M2 11.5h8" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Person Detail</h2>
            <p className="text-xs text-slate-500">{role} · identity, address, and employment</p>
          </div>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 6.5l2.5 2.5L10 3" />
              </svg>
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8.5 1.5l2 2L3.5 10.5H1.5v-2L8.5 1.5z" />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div className="p-5 space-y-3">
        <DetailSection
          title="Basic Information"
          open={openSection === 'Basic Information'}
          onToggle={() => setOpenSection('Basic Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
            <DetailSelect label="Type of Contact" value={form.typeOfContact} onChange={v => set('typeOfContact', v as PersonRow['type'])} editing={editing} options={['Client', 'Agency', 'Vendor', 'Industry']} />
            <DetailSelect label="Salutation (Sal)" value={form.sal} onChange={v => set('sal', v)} editing={editing} options={['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']} placeholder="Select…" />
            <DetailField label="First Name" value={form.firstName} onChange={v => set('firstName', v)} editing={editing} />
            <DetailField label="Middle Name" value={form.middleName} onChange={v => set('middleName', v)} editing={editing} />
            <DetailField label="Last Name" value={form.lastName} onChange={v => set('lastName', v)} editing={editing} />
            <DetailSelect label="Suffix" value={form.suffix} onChange={v => set('suffix', v)} editing={editing} options={['Jr', 'Sr', 'II', 'III', 'IV']} placeholder="Select…" />
            <DetailField label="TTB PQ#" value={form.ttbPq} onChange={v => set('ttbPq', v)} editing={editing} />
            <DetailField label="Nickname/Preferred First Name" value={form.nickname} onChange={v => set('nickname', v)} editing={editing} />
            <DetailField label="Alias/Former Name" value={form.alias} onChange={v => set('alias', v)} editing={editing} />
            <DetailField label="Internal Remark" value={form.internalRemark} onChange={v => set('internalRemark', v)} editing={editing} />
          </div>
        </DetailSection>

        <DetailSection
          title="Personal Address"
          open={openSection === 'Personal Address'}
          onToggle={() => setOpenSection('Personal Address')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            <DetailField label="Email" value={form.email} onChange={v => set('email', v)} editing={editing} />
            <DetailField label="Cell/Home Phone" value={form.cellHomePhone} onChange={v => set('cellHomePhone', v)} editing={editing} />
          </div>
          <div className="mt-4">
            <DetailField label="Street" value={form.street} onChange={v => set('street', v)} editing={editing} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 mt-4">
            <DetailField label="City" value={form.city} onChange={v => set('city', v)} editing={editing} />
            <DetailSelect label="State" value={form.state} onChange={v => set('state', v)} editing={editing} options={US_STATES} placeholder="Select…" />
            <DetailField label="Zip Code" value={form.zipCode} onChange={v => set('zipCode', v)} editing={editing} />
            <DetailSelect label="Country" value={form.country} onChange={v => set('country', v)} editing={editing} options={['United States', 'Canada', 'Mexico']} />
          </div>
        </DetailSection>

        <DetailSection
          title="Personal Information"
          open={openSection === 'Personal Information'}
          onToggle={() => setOpenSection('Personal Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
            <DetailField label="Social Security Number" value={form.ssn} onChange={v => set('ssn', v)} editing={editing} placeholder="XXX-XX-XXXX" />
            <DetailField label="Driver's License No" value={form.dlNo} onChange={v => set('dlNo', v)} editing={editing} />
            <DetailSelect label="State Issued" value={form.stateIssued} onChange={v => set('stateIssued', v)} editing={editing} options={US_STATES} placeholder="Select…" />
            <DetailField label="Date of Birth" value={form.dob} onChange={v => set('dob', v)} editing={editing} placeholder="MM/DD/YYYY" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-x-4 gap-y-4 mt-4">
            <DetailField label="Place of Birth" value={form.placeOfBirth} onChange={v => set('placeOfBirth', v)} editing={editing} />
            <label className="block min-w-0">
              <span className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-medium text-slate-500 leading-tight">US Citizen</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={form.usCitizen}
                disabled={!editing}
                onClick={() => set('usCitizen', !form.usCitizen)}
                className={`relative w-10 h-5 rounded-full transition-colors mt-1.5 disabled:opacity-60 ${form.usCitizen ? 'bg-[#12518c]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.usCitizen ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <DetailField label="Height" value={form.height} onChange={v => set('height', v)} editing={editing} />
            <DetailField label="Weight" value={form.weight} onChange={v => set('weight', v)} editing={editing} />
            <DetailField label="Eye Color" value={form.eyeColor} onChange={v => set('eyeColor', v)} editing={editing} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 mt-4">
            <DetailField label="Hair Color" value={form.hairColor} onChange={v => set('hairColor', v)} editing={editing} />
          </div>
        </DetailSection>

        <DetailSection
          title="Marital Information"
          open={openSection === 'Marital Information'}
          onToggle={() => setOpenSection('Marital Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-4">
            <DetailSelect label="Marital Status" value={form.maritalStatus} onChange={v => set('maritalStatus', v)} editing={editing} options={['Single', 'Married', 'Divorced', 'Widowed', 'Separated']} placeholder="Select…" />
            <DetailField label="Spouse Full Name" value={form.spouseFullName} onChange={v => set('spouseFullName', v)} editing={editing} />
            <DetailField label="Marriage Date" value={form.marriageDate} onChange={v => set('marriageDate', v)} editing={editing} placeholder="MM/DD/YYYY" />
            <DetailSelect label="Marriage State" value={form.marriageState} onChange={v => set('marriageState', v)} editing={editing} options={US_STATES} placeholder="Select…" />
            <DetailField label="Marriage City" value={form.marriageCity} onChange={v => set('marriageCity', v)} editing={editing} />
          </div>
        </DetailSection>

        <DetailSection
          title="Employment Information"
          open={openSection === 'Employment Information'}
          onToggle={() => setOpenSection('Employment Information')}
        >
          <div className="mb-4">
            <DetailField label="Job Title" value={form.jobTitle} onChange={v => set('jobTitle', v)} editing={editing} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
            <DetailField label="Company" value={form.company} onChange={v => set('company', v)} editing={editing} />
            <DetailField label="City" value={form.empCity} onChange={v => set('empCity', v)} editing={editing} />
            <DetailField label="From" value={form.empFrom} onChange={v => set('empFrom', v)} editing={editing} placeholder="MM/DD/YYYY" />
            <DetailField label="To" value={form.empTo} onChange={v => set('empTo', v)} editing={editing && !form.currentEmployment} placeholder="MM/DD/YYYY" readOnly={form.currentEmployment} />
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-slate-600 mt-4">
            <button
              type="button"
              role="switch"
              aria-checked={form.currentEmployment}
              disabled={!editing}
              onClick={() => set('currentEmployment', !form.currentEmployment)}
              className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-60 ${form.currentEmployment ? 'bg-[#12518c]' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.currentEmployment ? 'translate-x-5' : ''}`} />
            </button>
            Current Employment
          </label>
        </DetailSection>

        <DetailSection
          title="Questionnaire"
          open={openSection === 'Questionnaire'}
          onToggle={() => setOpenSection('Questionnaire')}
        >
          <div className="space-y-4">
            <OwnershipRadioGroup
              label="Do you have (or have you ever had) any direct or indirect interest in an alcoholic beverage license?"
              value={form.interestInLicense}
              onChange={v => set('interestInLicense', v)}
              readOnly={!editing}
              options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            />
            <OwnershipRadioGroup
              label="Have you (or any company you where/are involved in) had an alcoholic beverage license revoked, suspended or denied?"
              value={form.licenseRevoked}
              onChange={v => set('licenseRevoked', v)}
              readOnly={!editing}
              options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            />
            <OwnershipRadioGroup
              label="Have you ever been arrested, charged, convicted or placed on probation?"
              value={form.arrested}
              onChange={v => set('arrested', v)}
              readOnly={!editing}
              options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
            />
          </div>
        </DetailSection>

        <DetailSection
          title="Notes"
          open={openSection === 'Notes'}
          onToggle={() => setOpenSection('Notes')}
        >
          <label className="block min-w-0">
            <span className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-medium text-slate-500 leading-tight">Note Heading</span>
            </span>
            <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/80">
                {['B', 'I', 'U', 'S', '•', '1.', '≡', '🔗', '🖼'].map(btn => (
                  <button key={btn} type="button" disabled={!editing} className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-500 hover:bg-white disabled:opacity-50">{btn}</button>
                ))}
              </div>
              <textarea
                value={form.notes}
                readOnly={!editing}
                onChange={e => set('notes', e.target.value)}
                rows={4}
                placeholder="Additional notes…"
                className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y min-h-[96px] bg-transparent disabled:cursor-default"
              />
            </div>
          </label>
        </DetailSection>
      </div>
    </div>
  )
}

function PersonAddressesPage() {
  const [page, setPage] = useState(1)
  const cols = useTableColumns([
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'workPhone', label: 'Work Phone' },
    { key: 'street', label: 'Street' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip', label: 'Zip Code' },
    { key: 'country', label: 'Country' },
  ])
  const colBtn = 'p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 transition-all duration-200'

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Business Addresses</h2>
        <ColumnSettingsDropdown {...cols.dropdownProps} buttonClassName={colBtn} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px]">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60">
              {cols.show('company') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Company</th>}
              {cols.show('email') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Email</th>}
              {cols.show('workPhone') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Work Phone</th>}
              {cols.show('street') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Street</th>}
              {cols.show('city') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">City</th>}
              {cols.show('state') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">State</th>}
              {cols.show('zip') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Zip Code</th>}
              {cols.show('country') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Country</th>}
            </tr>
          </thead>
          <tbody>
            {PERSON_ADDRESSES.length === 0 ? (
              <tr>
                <td colSpan={cols.visibleCount} className="px-4 py-12 text-center text-sm text-slate-400 bg-slate-50/50">
                  No record Found!
                </td>
              </tr>
            ) : (
              PERSON_ADDRESSES.map((a, i) => (
                <tr
                  key={a.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-[#12518c]/5 ${
                    i % 2 === 1 ? 'bg-slate-50/40' : 'bg-[#f8fafc]'
                  }`}
                >
                  {cols.show('company') && (
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <button type="button" className="font-medium text-[#12518c] hover:underline text-left">
                        {a.company}
                      </button>
                    </td>
                  )}
                  {cols.show('email') && (
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {a.email ? (
                        <a href={`mailto:${a.email}`} className="text-[#12518c] hover:underline">
                          {a.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  )}
                  {cols.show('workPhone') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.workPhone || ''}</td>}
                  {cols.show('street') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.street || ''}</td>}
                  {cols.show('city') && <td className="px-4 py-3 text-sm text-slate-600">{a.city || ''}</td>}
                  {cols.show('state') && <td className="px-4 py-3 text-sm text-slate-600">{a.state || ''}</td>}
                  {cols.show('zip') && <td className="px-4 py-3 text-sm text-slate-600">{a.zip || ''}</td>}
                  {cols.show('country') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.country || ''}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddressTableFooter total={PERSON_ADDRESSES.length} page={page} onPageChange={setPage} />
    </section>
  )
}

function PersonChangeLogPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = PERSON_CHANGE_LOG.filter(e => {
    const q = search.toLowerCase()
    return (
      !q ||
      [e.statusDate, e.field, e.previousData, e.updatedData, e.notes, e.requestedBy].some(v =>
        String(v).toLowerCase().includes(q)
      )
    )
  })

  const cols = useTableColumns([
    { key: 'statusDate', label: 'Status Date' },
    { key: 'field', label: 'Field' },
    { key: 'previousData', label: 'Previous Data' },
    { key: 'updatedData', label: 'Updated Data' },
    { key: 'notes', label: 'Notes' },
    { key: 'requestedBy', label: 'Requested By' },
  ])
  const colBtn = 'p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 transition-all duration-200'

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Change Log</h2>
        <div className="flex items-center gap-2">
          <AddressSearchInput
            value={search}
            onChange={v => {
              setSearch(v)
              setPage(1)
            }}
          />
          <ColumnSettingsDropdown {...cols.dropdownProps} buttonClassName={colBtn} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60">
              {cols.show('statusDate') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Status Date</th>}
              {cols.show('field') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Field</th>}
              {cols.show('previousData') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Previous Data</th>}
              {cols.show('updatedData') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Updated Data</th>}
              {cols.show('notes') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Notes</th>}
              {cols.show('requestedBy') && <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Requested By</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={cols.visibleCount} className="px-4 py-12 text-center text-sm text-slate-400 bg-slate-50/50">
                  No record Found!
                </td>
              </tr>
            ) : (
              filtered.map((e, i) => (
                <tr
                  key={e.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-[#12518c]/5 ${
                    i % 2 === 1 ? 'bg-slate-50/40' : 'bg-[#f8fafc]'
                  }`}
                >
                  {cols.show('statusDate') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap tabular-nums">{e.statusDate}</td>}
                  {cols.show('field') && (
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-[200px]">
                      <span className="line-clamp-2" title={e.field}>{e.field}</span>
                    </td>
                  )}
                  {cols.show('previousData') && (
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[220px]">
                      <span className="line-clamp-2" title={e.previousData || undefined}>{e.previousData || '—'}</span>
                    </td>
                  )}
                  {cols.show('updatedData') && (
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[220px]">
                      <span className="line-clamp-2" title={e.updatedData || undefined}>{e.updatedData || '—'}</span>
                    </td>
                  )}
                  {cols.show('notes') && (
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[180px]">
                      <span className="line-clamp-2" title={e.notes || undefined}>{e.notes || '—'}</span>
                    </td>
                  )}
                  {cols.show('requestedBy') && (
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {e.requestedBy}
                      </span>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
    </section>
  )
}

function PersonNoteTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Flag: 'bg-amber-50 text-amber-800 border-amber-200',
    Note: 'bg-[#12518c]/10 text-[#12518c] border-[#12518c]/20',
    Task: 'bg-violet-50 text-violet-800 border-violet-200',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${styles[type] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {type}
    </span>
  )
}

function PersonAddNoteModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void
  onSave: (note: { type: string; note: string }) => void
  initial?: { type: string; note: string }
}) {
  const isEdit = Boolean(initial)
  const [type, setType] = useState(initial?.type ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [errors, setErrors] = useState({ type: false, note: false })
  const noteRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const validate = () => {
    const next = { type: !type.trim(), note: !note.trim() }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({ type: type.trim(), note: note.trim() })
  }

  const handleTypeChange = (v: string) => {
    setType(v)
    if (errors.type) setErrors(prev => ({ ...prev, type: false }))
    if (v && noteRef.current) noteRef.current.focus()
  }

  return (
    <AddressModalShell maxWidth="max-w-lg" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.8-5 7-5 7z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{isEdit ? 'People — Edit Note' : 'People — Add Note'}</h3>
            <p className="text-[11px] text-slate-500">{isEdit ? 'Update this note for the person' : 'Add a flag, note, or task for this person'}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div>
          <OwnershipFormSelect
            label="Type"
            required
            value={type}
            onChange={handleTypeChange}
            options={[...PERSON_NOTE_TYPES]}
            placeholder="Select…"
          />
          {errors.type && <p className="mt-1 text-[11px] text-[#bb5757]">Type is required.</p>}
        </div>

        <div>
          <OwnershipFormLabel required>Note</OwnershipFormLabel>
          <textarea
            ref={noteRef}
            value={note}
            onChange={e => {
              setNote(e.target.value)
              if (errors.note) setErrors(prev => ({ ...prev, note: false }))
            }}
            rows={5}
            placeholder="Enter your note…"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 resize-y min-h-[120px] ${
              errors.note
                ? 'border-[#bb5757] focus:ring-[#bb5757]/20 focus:border-[#bb5757]'
                : 'border-slate-200 focus:ring-[#12518c]/25 focus:border-[#12518c]'
            }`}
          />
          {errors.note && <p className="mt-1 text-[11px] text-[#bb5757]">Note is required.</p>}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!type.trim() || !note.trim()}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
      </div>
    </AddressModalShell>
  )
}

function PersonNotesPage() {
  const [notes, setNotes] = useState(PERSON_NOTES)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingNote, setEditingNote] = useState<(typeof PERSON_NOTES)[number] | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<number | null>(null)
  const [nextId, setNextId] = useState(() => Math.max(0, ...PERSON_NOTES.map(n => n.id)) + 1)

  const filtered = notes.filter(n => {
    const q = search.toLowerCase()
    return !q || [n.type, n.note, n.author].some(v => v.toLowerCase().includes(q))
  })

  const confirmDeleteNote = () => {
    if (deleteNoteId == null) return
    setNotes(prev => prev.filter(n => n.id !== deleteNoteId))
    setDeleteNoteId(null)
  }

  const addNote = (data: { type: string; note: string }) => {
    setNotes(prev => [
      { id: nextId, type: data.type, note: data.note, author: 'Hammad Iftikhar' },
      ...prev,
    ])
    setNextId(id => id + 1)
    setShowAddModal(false)
    setPage(1)
  }

  const updateNote = (data: { type: string; note: string }) => {
    if (!editingNote) return
    setNotes(prev => prev.map(n => (n.id === editingNote.id ? { ...n, type: data.type, note: data.note } : n)))
    setEditingNote(null)
  }

  const cols = useTableColumns([
    { key: 'type', label: 'Type' },
    { key: 'note', label: 'Note' },
    { key: 'author', label: 'Author' },
  ])
  const colBtn = 'p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 transition-all duration-200'

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Notes</h2>
        <div className="flex items-center gap-2">
          <AddressSearchInput
            value={search}
            onChange={v => {
              setSearch(v)
              setPage(1)
            }}
          />
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-[#12518c] text-white hover:bg-[#0e4173] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 2v8M2 6h8" />
            </svg>
            Add New
          </button>
          <ColumnSettingsDropdown {...cols.dropdownProps} buttonClassName={colBtn} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60">
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center w-16">Action</th>
              {cols.show('type') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Type</th>}
              {cols.show('note') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Note</th>}
              {cols.show('author') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Author</th>}
              <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center w-16" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={cols.visibleCount + 2} className="px-4 py-12 text-center text-sm text-slate-400 bg-slate-50/50">
                  No record Found!
                </td>
              </tr>
            ) : (
              filtered.map((note, i) => (
                <tr
                  key={note.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-[#12518c]/5 ${
                    i % 2 === 1 ? 'bg-slate-50/40' : 'bg-[#f8fafc]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setEditingNote(note)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                          <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  {cols.show('type') && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PersonNoteTypeBadge type={note.type} />
                    </td>
                  )}
                  {cols.show('note') && <td className="px-4 py-3 text-sm text-slate-700">{note.note}</td>}
                  {cols.show('author') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{note.author}</td>}
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setDeleteNoteId(note.id)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors"
                        title="Delete"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M10 11v6M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />

      {showAddModal && (
        <PersonAddNoteModal
          onClose={() => setShowAddModal(false)}
          onSave={addNote}
        />
      )}

      {editingNote && (
        <PersonAddNoteModal
          initial={{ type: editingNote.type, note: editingNote.note }}
          onClose={() => setEditingNote(null)}
          onSave={updateNote}
        />
      )}

      {deleteNoteId != null && (
        <AddressDeleteConfirmModal
          title="Delete note"
          locationName={notes.find(n => n.id === deleteNoteId)?.note ?? 'this note'}
          onCancel={() => setDeleteNoteId(null)}
          onConfirm={confirmDeleteNote}
        />
      )}
    </section>
  )
}

function AddCompanyPage({
  onCancel,
  onSave,
}: {
  onCancel: () => void
  onSave: (company: CompanyRow) => void
}) {
  const [openSection, setOpenSection] = useState('Company Information')
  const [showDbaVariations, setShowDbaVariations] = useState(false)
  const [showEinVariations, setShowEinVariations] = useState(false)
  const [showFaxVariations, setShowFaxVariations] = useState(false)
  const [form, setForm] = useState({
    companyType: '' as '' | CompanyRow['type'],
    entityName: '',
    dba: '',
    dbaLabel: '',
    dbaVariation: '',
    tradeName: '',
    ein: '',
    einLabel: '',
    einVariation: '',
    phone: '',
    extension: '',
    fax: '',
    faxLabel: '',
    faxVariation: '',
  })
  const [errors, setErrors] = useState({ companyType: false, entityName: false })

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'companyType' || key === 'entityName') {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const submit = () => {
    const next = {
      companyType: !form.companyType,
      entityName: !form.entityName.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) {
      setOpenSection('Company Information')
      return
    }

    onSave({
      id: Date.now(),
      name: form.entityName.trim(),
      dba: form.dba.trim(),
      status: 'Active',
      alert: null,
      type: form.companyType as CompanyRow['type'],
      starred: false,
    })
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">Add New Company</h1>
          <p className="mt-1 text-sm text-slate-500">Enter company identity, contact details, and tax information.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4.5h12M2 8h12M2 11.5h8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900">Company Detail</h2>
              <p className="text-xs text-slate-500">Core identity and contact information</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <DetailSection
            title="Company Information"
            open={openSection === 'Company Information'}
            onToggle={() => setOpenSection('Company Information')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <div className="sm:col-span-2">
                <DetailSelect
                  label="Company Type *"
                  value={form.companyType}
                  onChange={v => set('companyType', v as CompanyRow['type'])}
                  editing
                  options={['Client', 'Prospect', 'Vendor']}
                  placeholder="Select…"
                />
                {errors.companyType && <p className="mt-1 text-[11px] text-[#bb5757]">Company type is required.</p>}
              </div>
              <div>
                <DetailField label="Entity Name *" value={form.entityName} onChange={v => set('entityName', v)} editing />
                {errors.entityName && <p className="mt-1 text-[11px] text-[#bb5757]">Entity name is required.</p>}
              </div>
              <DetailField
                label="DBA"
                value={form.dba}
                onChange={v => set('dba', v)}
                editing
                action={
                  <VariationButton
                    active={showDbaVariations}
                    onClick={() => setShowDbaVariations(v => !v)}
                  />
                }
              />
              {showDbaVariations && (
                <>
                  <DetailField label="Label" value={form.dbaLabel} onChange={v => set('dbaLabel', v)} editing />
                  <DetailField label="DBA Variation" value={form.dbaVariation} onChange={v => set('dbaVariation', v)} editing />
                </>
              )}
              <DetailField label="Trade Name" value={form.tradeName} onChange={v => set('tradeName', v)} editing readOnly />
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                <DetailField
                  label="EIN"
                  value={form.ein}
                  onChange={v => set('ein', v)}
                  editing
                  action={
                    <VariationButton
                      active={showEinVariations}
                      onClick={() => setShowEinVariations(v => !v)}
                    />
                  }
                />
                {showEinVariations && (
                  <>
                    <DetailField label="Label" value={form.einLabel} onChange={v => set('einLabel', v)} editing />
                    <DetailField label="EIN Variation" value={form.einVariation} onChange={v => set('einVariation', v)} editing />
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4 mt-4">
              <DetailField label="Phone" value={form.phone} onChange={v => set('phone', v)} editing />
              <DetailField label="Extension" value={form.extension} onChange={v => set('extension', v)} editing />
              <DetailField
                label="Fax"
                value={form.fax}
                onChange={v => set('fax', v)}
                editing
                action={
                  <VariationButton
                    active={showFaxVariations}
                    onClick={() => setShowFaxVariations(v => !v)}
                  />
                }
              />
              {showFaxVariations && (
                <>
                  <DetailField label="Label" value={form.faxLabel} onChange={v => set('faxLabel', v)} editing />
                  <DetailField label="Fax Variation" value={form.faxVariation} onChange={v => set('faxVariation', v)} editing />
                </>
              )}
            </div>
          </DetailSection>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  )
}

function CompaniesPage({
  companies,
  onCompaniesChange,
  onSelectCompany,
  onAddCompany,
}: {
  companies: CompanyRow[]
  onCompaniesChange: (companies: CompanyRow[] | ((prev: CompanyRow[]) => CompanyRow[])) => void
  onSelectCompany: (id: number) => void
  onAddCompany: () => void
}) {
  const COMPANY_COLUMNS = [
    { key: 'name', label: 'Company Name' },
    { key: 'dba', label: 'DBA' },
    { key: 'type', label: 'Company Type' },
    { key: 'status', label: 'Status' },
    { key: 'alerts', label: 'Alerts' },
  ] as const

  const companyCols = useTableColumns(COMPANY_COLUMNS)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const total = 550

  const filtered = companies.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dba.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStar = (id: number) => {
    onCompaniesChange(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c))
  }

  const setAlertStatus = (id: number, status: AlertStatus) => {
    onCompaniesChange(prev => prev.map(c => c.id === id ? { ...c, alert: status } : c))
  }

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        </div>
        <button
          type="button"
          onClick={onAddCompany}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors shadow-sm"
        >
          Add New
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] text-slate-400">Note: Search does not affect export</p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5" cy="5" r="3.5" />
                <path d="M8 8l2.5 2.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Here"
                className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/30 focus:border-[#12518c] w-44 transition-all"
              />
            </div>
            <Select placeholder="Company Type" options={['Bond', 'Client', 'Industry', 'Registered Agent', 'Vendor', 'Warehouse']} />
            <Select placeholder="Alerts" options={['Pending', 'Work Stop', 'No Alert']} />
            <Select placeholder="Status" options={['Active', 'Inactive', 'Archived']} />
            <button className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-600 hover:bg-slate-700 transition-colors">
              Export
            </button>
            <ColumnSettingsDropdown {...companyCols.dropdownProps} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pl-4 pr-0 py-3 w-8" />
                {companyCols.show('name') && (
                  <th className="pl-2 pr-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <span className="inline-flex items-center gap-1">
                      Company Name
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                        <path d="M5 7.5V2.5M2.5 5L5 2.5 7.5 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </th>
                )}
                {companyCols.show('dba') && (
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">DBA</th>
                )}
                {companyCols.show('type') && (
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Company Type</th>
                )}
                {companyCols.show('status') && (
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                )}
                {companyCols.show('alerts') && (
                  <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Alerts</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-slate-50 transition-colors ${
                    c.alert === 'Work Stop'
                      ? 'bg-danger-light hover:bg-danger-lighter text-danger'
                      : i % 2 === 1
                        ? 'bg-slate-50/80 hover:bg-[#12518c]/5'
                        : 'bg-white hover:bg-[#12518c]/5'
                  }`}
                >
                  <td className="pl-4 pr-0 py-3.5">
                    <button
                      onClick={() => toggleStar(c.id)}
                      className="group flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#e1c16e]/20 transition-colors"
                      title={c.starred ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill={c.starred ? '#e1c16e' : 'none'}
                        stroke={c.starred ? '#e1c16e' : (c.alert === 'Work Stop' ? '#bb5757' : '#94a3b8')}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all group-hover:scale-110"
                      >
                        <path d="M7.5 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
                      </svg>
                    </button>
                  </td>
                  {companyCols.show('name') && (
                    <td className="pl-2 pr-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => onSelectCompany(c.id)}
                        className={`text-sm font-medium cursor-pointer text-left ${
                          c.alert === 'Work Stop' ? 'text-danger hover:text-danger-hover' : 'text-[#12518c] hover:text-[#0e4173]'
                        }`}
                      >
                        {c.name}
                      </button>
                    </td>
                  )}
                  {companyCols.show('dba') && (
                    <td className={`px-5 py-3.5 text-sm ${
                      c.alert === 'Work Stop' ? 'text-danger' : 'text-slate-600'
                    }`}>
                      {c.dba || '—'}
                    </td>
                  )}
                  {companyCols.show('type') && (
                    <td className={`px-5 py-3.5 text-sm ${c.alert === 'Work Stop' ? 'text-danger' : 'text-slate-600'}`}>
                      {c.type}
                    </td>
                  )}
                  {companyCols.show('status') && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center">
                        <CompanyStatusBadge status={c.status} alert={c.alert === 'Work Stop'} />
                      </div>
                    </td>
                  )}
                  {companyCols.show('alerts') && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center">
                        <AlertDropdown
                          status={c.alert}
                          onChange={(s) => setAlertStatus(c.id, s)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
          <span className="text-sm text-slate-500">
            Total: <span className="font-semibold text-slate-700">{total}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-8 h-8 px-2.5 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  page === n
                    ? 'bg-[#12518c] text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              disabled={page === 5}
              onClick={() => setPage(p => Math.min(5, p + 1))}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function CompanySummaryPage({
  company,
  tab,
  subPage,
  onTabChange,
  onSubPageChange,
}: {
  company: CompanyRow
  tab: (typeof COMPANY_DETAIL_TABS)[number]
  subPage: string | null
  onTabChange: (tab: (typeof COMPANY_DETAIL_TABS)[number]) => void
  onSubPageChange: (subPage: string | null) => void
}) {
  const [starred, setStarred] = useState(company.starred)
  const [alertStatus, setAlertStatus] = useState<AlertStatus>(company.alert)
  const [notify, setNotify] = useState(true)
  const [changeFilter, setChangeFilter] = useState('')
  const [detailEditRequest, setDetailEditRequest] = useState(0)
  const companyId = 1000 + company.id

  const filteredChanges = RECENT_CHANGES.filter(c =>
    !changeFilter || c.type.toLowerCase().includes(changeFilter.toLowerCase()) || c.detail.toLowerCase().includes(changeFilter.toLowerCase())
  )

  const workStopActive = alertStatus === 'Work Stop'

  return (
    <div className="space-y-5 animate-[fadeIn_0.25s_ease-out]">
      {/* Company identity — parent above tabs */}
      <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm ${
        workStopActive ? 'border-danger-border' : 'border-slate-200'
      }`}>
        {workStopActive && (
          <div className="px-5 py-2 bg-[#bb5757] text-white text-xs font-semibold flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M5.5 5.5l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Work Stop is active — compliance work is paused for this company
          </div>
        )}
        <div className={`px-5 py-5 ${workStopActive ? 'bg-danger-light/40' : ''}`}>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStarred(s => !s)}
                  className="w-8 h-8 rounded-lg hover:bg-[#e1c16e]/20 flex items-center justify-center transition-colors"
                  title={starred ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 15 15"
                    fill={starred ? '#e1c16e' : 'none'}
                    stroke={starred ? '#e1c16e' : (workStopActive ? '#bb5757' : '#94a3b8')}
                    strokeWidth="1.4"
                  >
                    <path d="M7.5 1.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
                  </svg>
                </button>
                <h1 className={`text-xl sm:text-2xl font-bold truncate ${workStopActive ? 'text-danger' : 'text-slate-900'}`}>
                  {company.name}
                </h1>
                <CompanyStatusBadge status={company.status} alert={workStopActive} />
                <AlertDropdown status={alertStatus} onChange={setAlertStatus} />
              </div>
              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm pl-10 ${workStopActive ? 'text-danger' : 'text-slate-600'}`}>
                <span><span className={workStopActive ? 'text-danger-muted' : 'text-slate-400'}>DBA</span> {company.dba || '—'}</span>
                <span className={workStopActive ? 'text-danger/40' : 'text-slate-300'}>·</span>
                <span><span className={workStopActive ? 'text-danger-muted' : 'text-slate-400'}>Company ID</span> {companyId}</span>
                <span className={workStopActive ? 'text-danger/40' : 'text-slate-300'}>·</span>
                <span><span className={workStopActive ? 'text-danger-muted' : 'text-slate-400'}>Type</span> {company.type}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <button
                  type="button"
                  role="switch"
                  aria-checked={notify}
                  onClick={() => setNotify(n => !n)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${notify ? 'bg-[#12518c]' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${notify ? 'translate-x-5' : ''}`} />
                </button>
                Enable Change Notification
              </label>
              <button
                type="button"
                onClick={() => {
                  setDetailEditRequest(request => request + 1)
                  onTabChange('Detail')
                }}
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                title="Edit company"
                aria-label="Edit company"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                </svg>
              </button>
              <button type="button" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="More">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="3" r="1.2" />
                  <circle cx="8" cy="8" r="1.2" />
                  <circle cx="8" cy="13" r="1.2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation — separate sticky bar below company info */}
      <nav
        aria-label="Company sections"
        className="-mt-1 rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto px-2 sm:px-3 border-b border-slate-100">
          <div className="flex items-stretch gap-0 min-w-max" role="tablist">
            {COMPANY_DETAIL_TABS.map(t => {
              const isActive = tab === t
              const isDisabled = t === 'Ownership'

              return (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  onClick={() => {
                    if (isDisabled) return
                    onTabChange(t)
                  }}
                  title={isDisabled ? 'Ownership is temporarily unavailable' : undefined}
                  className={`relative px-3.5 sm:px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isDisabled
                      ? 'text-slate-300 cursor-not-allowed'
                      : isActive
                        ? 'text-[#12518c]'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                  <span
                    className={`absolute left-2 right-2 bottom-0 h-0.5 rounded-full transition-opacity ${
                      isActive && !isDisabled ? 'bg-[#12518c] opacity-100' : 'bg-transparent opacity-0'
                    }`}
                    aria-hidden
                  />
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {tab === 'Work Stop' ? (
        <CompanyWorkStopPage companyId={companyId} />
      ) : tab === 'Detail' ? (
        <CompanyDetailPage company={company} companyId={companyId} editRequest={detailEditRequest} />
      ) : tab === 'Addresses' ? (
        <CompanyAddressesPage companyId={companyId} />
      ) : tab === 'Contacts' ? (
        <CompanyContactsPage
          companyId={companyId}
          companyName={company.name}
          subPage={subPage}
          onSubPageChange={onSubPageChange}
        />
      ) : tab === 'Ownership' ? (
        <CompanyOwnershipPage
          companyId={companyId}
          companyName={company.name}
          subPage={subPage}
          onSubPageChange={onSubPageChange}
        />
      ) : tab === 'Licenses & Reporting' ? (
        <CompanyLicensesPage companyId={companyId} />
      ) : tab === 'Credentials' ? (
        <CompanyCredentialsPage companyId={companyId} />
      ) : tab === 'Account Activity' ? (
        <CompanyAccountActivityPage companyId={companyId} companyName={company.name} />
      ) : tab === 'Scope' ? (
        <CompanyScopePage companyId={companyId} />
      ) : tab === 'Change Log' ? (
        <CompanyChangeLogPage companyId={companyId} />
      ) : tab !== 'Summary' ? (
        <WorkInProgressPage title={tab} />
      ) : (
        <div className="space-y-5">
          {/* Row 1: Service Scope | Ship Compliant */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
            <SummaryCard
              title="Service Scope"
              count={SERVICE_SCOPE.length}
              fill
              actions={
                <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Column settings">
                  <GridViewIcon />
                </button>
              }
            >
              <div className="overflow-x-auto -mx-1 h-full">
                <table className="w-full table-fixed min-w-[520px]">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Department', 'Service Level', 'Sub-Service', 'Service Type', 'Status', 'Specialists'].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SERVICE_SCOPE.map((row, i) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                        <td className="px-2 py-2.5 text-xs text-slate-700 truncate" title={row.department}>{row.department}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 truncate" title={row.serviceLevel}>{row.serviceLevel}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 truncate">{row.subType}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 truncate" title={row.serviceType}>{row.serviceType}</td>
                        <td className="px-2 py-2.5">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500 text-white">{row.status}</span>
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 truncate">{row.specialists}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SummaryCard>

            <SummaryCard title="Ship Compliant" fill>
              <dl className="h-full flex flex-col justify-center space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Autofile</dt>
                  <dd className="font-medium text-slate-800">Enabled</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide">License Type</dt>
                  <dd className="font-medium text-slate-800">DTC</dd>
                </div>
                <div className="flex items-start justify-between gap-3 py-2">
                  <dt className="text-slate-400 text-xs font-semibold uppercase tracking-wide shrink-0">Managed By</dt>
                  <dd className="font-medium text-slate-800 text-right">Client — DHWC Monitoring</dd>
                </div>
              </dl>
            </SummaryCard>
          </div>

          {/* Row 2: Contacts | Addresses */}
          <div className="relative z-0 grid grid-cols-1 xl:grid-cols-2 gap-5">
            <SummaryCard
              title="Contacts"
              count={COMPANY_CONTACTS.length}
              actions={
                <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Column settings">
                  <GridViewIcon />
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Name', 'Role', 'Email', 'Work', 'Cell'].map(h => (
                        <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPANY_CONTACTS.map((c, i) => (
                      <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                        <td className="px-2 py-2.5 text-xs font-medium text-[#12518c] truncate" title={c.name}>{c.name}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 truncate">{c.role}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 truncate" title={c.email}>{c.email}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-500 truncate">{c.work}</td>
                        <td className="px-2 py-2.5 text-xs text-slate-500 truncate">{c.cell}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SummaryCard>

            <SummaryCard
              title="Addresses"
              count={COMPANY_ADDRESSES.length}
              actions={
                <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Column settings">
                  <GridViewIcon />
                </button>
              }
            >
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Label', 'Street', 'City', 'State', 'Country'].map(h => (
                      <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPANY_ADDRESSES.map((a, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/80' : 'bg-white'}>
                      <td className="px-2 py-2.5 text-xs font-medium text-slate-700 truncate">{a.label}</td>
                      <td className="px-2 py-2.5 text-xs text-slate-600 truncate" title={a.street}>{a.street}</td>
                      <td className="px-2 py-2.5 text-xs text-slate-600 truncate">{a.city}</td>
                      <td className="px-2 py-2.5 text-xs text-slate-600">{a.state}</td>
                      <td className="px-2 py-2.5 text-xs text-slate-500 truncate" title={a.country}>{a.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SummaryCard>
          </div>

          {/* Row 3: Renewals full width */}
          <SummaryCard
            title="Renewals Due in the Next 30 Days"
            count={COMPANY_RENEWALS.length}
            actions={
              <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Column settings">
                <GridViewIcon />
              </button>
            }
            bodyClassName="!p-0"
          >
            <div>
              <table className="w-full">
                <thead className="bg-white shadow-[0_1px_0_0_#e2e8f0]">
                  <tr>
                    {['State', 'Function', 'Item', 'Expiration Date', 'Action In'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap bg-white">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPANY_RENEWALS.map((r, i) => (
                    <tr key={i} className={`border-t border-slate-50 ${i % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-[#12518c]/5 transition-colors`}>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">{r.state}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">{r.function}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-600 truncate max-w-[140px]" title={r.item}>{r.item}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500 whitespace-nowrap">{r.expiration}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger-light text-[#bb5757] border border-danger-border">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#bb5757]" />
                          {r.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SummaryCard>

          {/* Row 4: Recent Changes full width */}
          <SummaryCard
            title="Recent Changes"
            count={filteredChanges.length}
            actions={
              <div className="relative inline-flex items-center">
                <select
                  value={changeFilter}
                  onChange={e => setChangeFilter(e.target.value)}
                  className={`appearance-none text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-600 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#12518c]/30 cursor-pointer min-w-[180px] ${
                    changeFilter ? 'pl-2.5 pr-14' : 'pl-2.5 pr-8'
                  }`}
                >
                  <option value="" disabled hidden>
                    Filter By Change Type
                  </option>
                  <option value="License">License</option>
                  <option value="Address">Address</option>
                  <option value="Scope">Scope</option>
                  <option value="Detail">Detail</option>
                  <option value="Contact">Contact</option>
                  <option value="Work Stop">Work Stop</option>
                </select>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-1.5 gap-0.5">
                  {changeFilter ? (
                    <button
                      type="button"
                      onClick={() => setChangeFilter('')}
                      className="pointer-events-auto w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                      title="Clear filter"
                      aria-label="Clear filter"
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 2l6 6M8 2L2 8" />
                      </svg>
                    </button>
                  ) : null}
                  <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 3.5L5 6.5 7.5 3.5" />
                    </svg>
                  </span>
                </div>
              </div>
            }
          >
            <div className="space-y-0">
              {filteredChanges.map((c, i) => (
                <div key={i} className="flex gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <span className="mt-1.5 w-2 h-2 rounded-sm bg-[#e1c16e] flex-shrink-0 rotate-45" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-semibold text-[#12518c]">{c.type}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{c.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.detail}</p>
                  </div>
                </div>
              ))}
              {filteredChanges.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No matching changes</p>
              )}
            </div>
          </SummaryCard>
        </div>
      )}
    </div>
  )
}

type AddressRow = {
  id: number
  label: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  active: boolean
}

type ContactRow = {
  id: number
  name: string
  role: string
  work: string
  email: string
  street: string
  notes: string
  specialist: string
  category: string
  active: boolean
  cell: string
}

function CompanyContactsPage({
  companyId,
  companyName,
  subPage,
  onSubPageChange,
}: {
  companyId: number
  companyName: string
  subPage: string | null
  onSubPageChange: (subPage: string | null) => void
}) {
  const [currentContacts, setCurrentContacts] = useState<ContactRow[]>(COMPANY_CONTACTS)
  const [pastContacts] = useState<ContactRow[]>(PAST_CONTACTS)
  const [currentSearch, setCurrentSearch] = useState('')
  const [pastSearch, setPastSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingInactiveId, setPendingInactiveId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [reasonNote, setReasonNote] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view' | null>(null)
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const filterContacts = (list: ContactRow[], q: string) =>
    list.filter(c =>
      !q ||
      [c.name, c.role, c.work, c.email, c.street, c.notes, c.specialist, c.category].some(v =>
        v.toLowerCase().includes(q.toLowerCase())
      )
    )

  const filteredCurrent = filterContacts(currentContacts, currentSearch)
  const filteredPast = filterContacts(pastContacts, pastSearch)
  const pendingContact = currentContacts.find(c => c.id === pendingInactiveId) ?? null

  const requestInactive = (id: number) => {
    setPendingInactiveId(id)
    setConfirmOpen(true)
    setReasonOpen(false)
    setSuccessOpen(false)
    setReasonNote('')
    setReasonError(false)
  }

  const closeInactiveFlow = () => {
    setConfirmOpen(false)
    setReasonOpen(false)
    setSuccessOpen(false)
    setPendingInactiveId(null)
    setReasonNote('')
    setReasonError(false)
  }

  const openAdd = () => {
    setEditingContact(null)
    onSubPageChange('Add New Contact')
  }

  const openView = (contact: ContactRow) => {
    setEditingContact(contact)
    setFormMode('view')
  }

  const openEdit = (contact: ContactRow) => {
    setEditingContact(contact)
    setFormMode(null)
    onSubPageChange('Edit Contact')
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingContact(null)
  }

  const saveContact = (data: Omit<ContactRow, 'id' | 'active' | 'cell'> & { id?: number; cell?: string }) => {
    if ((formMode === 'edit' || subPage === 'Edit Contact') && data.id != null) {
      setCurrentContacts(prev =>
        prev.map(c => (c.id === data.id ? { ...c, ...data, cell: data.cell ?? c.cell, active: c.active } : c))
      )
    } else {
      const nextId = Math.max(0, ...currentContacts.map(c => c.id), ...pastContacts.map(c => c.id)) + 1
      setCurrentContacts(prev => [
        {
          id: nextId,
          name: data.name,
          role: data.role,
          work: data.work,
          email: data.email,
          street: data.street,
          notes: data.notes,
          specialist: data.specialist,
          category: data.category,
          cell: data.cell ?? '',
          active: true,
        },
        ...prev,
      ])
    }
    closeForm()
    onSubPageChange(null)
  }

  const removeContact = (id: number) => {
    setCurrentContacts(prev => prev.filter(c => c.id !== id))
    setDeleteConfirmId(null)
  }

  const currentCols = useTableColumns([
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'work', label: 'Work Phone' },
    { key: 'email', label: 'Email' },
    { key: 'street', label: 'Street' },
    { key: 'notes', label: 'Notes' },
    { key: 'specialist', label: 'Specialist' },
    { key: 'category', label: 'Category' },
    { key: 'active', label: 'Active/Inactive' },
  ])
  const pastCols = useTableColumns([
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'work', label: 'Work Phone' },
    { key: 'email', label: 'Email' },
    { key: 'street', label: 'Street' },
    { key: 'notes', label: 'Notes' },
    { key: 'specialist', label: 'Specialist' },
    { key: 'category', label: 'Category' },
    { key: 'active', label: 'Active/Inactive' },
  ])
  const contactColBtn = 'p-2 rounded-lg border border-slate-200 transition-all duration-200'

  if (subPage === 'Add New Contact') {
    return (
      <AddContactPage
        companyId={companyId}
        companyName={companyName}
        onCancel={() => onSubPageChange(null)}
        onSave={saveContact}
      />
    )
  }

  if (subPage === 'Edit Contact' && editingContact) {
    return (
      <EditContactPage
        companyId={companyId}
        companyName={companyName}
        contact={editingContact}
        onCancel={() => {
          setEditingContact(null)
          onSubPageChange(null)
        }}
        onSave={saveContact}
      />
    )
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#12518c]">Current Contacts</h2>
              <p className="text-xs text-slate-500">People linked to this company</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AddressSearchInput value={currentSearch} onChange={setCurrentSearch} />
            <ColumnSettingsDropdown {...currentCols.dropdownProps} buttonClassName={contactColBtn} />
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {currentCols.show('name') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Name</th>}
                {currentCols.show('role') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Role</th>}
                {currentCols.show('work') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Work Phone</th>}
                {currentCols.show('email') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Email</th>}
                {currentCols.show('street') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Street</th>}
                {currentCols.show('notes') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Notes</th>}
                {currentCols.show('specialist') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Specialist</th>}
                {currentCols.show('category') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Category</th>}
                {currentCols.show('active') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center">Active/Inactive</th>}
                <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCurrent.length === 0 ? (
                <tr>
                  <td colSpan={currentCols.visibleCount + 1} className="px-4 py-12 text-center text-sm text-slate-400">No record Found!</td>
                </tr>
              ) : (
                filteredCurrent.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    {currentCols.show('name') && <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{c.name || '—'}</td>}
                    {currentCols.show('role') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.role || '—'}</td>}
                    {currentCols.show('work') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.work || '—'}</td>}
                    {currentCols.show('email') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.email || '—'}</td>}
                    {currentCols.show('street') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.street || '—'}</td>}
                    {currentCols.show('notes') && <td className="px-4 py-3 text-sm text-slate-600 max-w-[140px] truncate" title={c.notes}>{c.notes || '—'}</td>}
                    {currentCols.show('specialist') && (
                      <td className="px-4 py-3">
                        {c.specialist ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#12518c]/10 text-[#12518c]">
                            {c.specialist}
                          </span>
                        ) : '—'}
                      </td>
                    )}
                    {currentCols.show('category') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.category || '—'}</td>}
                    {currentCols.show('active') && (
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <AddressActiveToggle
                            active={c.active}
                            onChange={() => {
                              if (c.active) requestInactive(c.id)
                            }}
                          />
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => openView(c)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="View">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                            <circle cx="8" cy="8" r="1.75" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => openEdit(c)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeleteConfirmId(c.id)} className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors" title="Delete">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AddressTableFooter total={filteredCurrent.length} page={currentPage} onPageChange={setCurrentPage} />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#12518c]">Past Contacts</h2>
              <p className="text-xs text-slate-500">Historical contacts no longer linked</p>
            </div>
          </div>
          <AddressSearchInput value={pastSearch} onChange={setPastSearch} />
          <ColumnSettingsDropdown {...pastCols.dropdownProps} buttonClassName={contactColBtn} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {pastCols.show('name') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Name</th>}
                {pastCols.show('role') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Role</th>}
                {pastCols.show('work') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Work Phone</th>}
                {pastCols.show('email') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Email</th>}
                {pastCols.show('street') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Street</th>}
                {pastCols.show('notes') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Notes</th>}
                {pastCols.show('specialist') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Specialist</th>}
                {pastCols.show('category') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-left">Category</th>}
                {pastCols.show('active') && <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center">Active/Inactive</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPast.length === 0 ? (
                <tr>
                  <td colSpan={pastCols.visibleCount} className="px-4 py-14 text-center">
                    <p className="text-sm font-medium text-slate-500">No record Found!</p>
                    <p className="text-xs text-slate-400 mt-1">Past contacts will appear here when available</p>
                  </td>
                </tr>
              ) : (
                filteredPast.map((c, i) => (
                  <tr key={c.id} className={`border-b border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                    {pastCols.show('name') && <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{c.name || '—'}</td>}
                    {pastCols.show('role') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.role || '—'}</td>}
                    {pastCols.show('work') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.work || '—'}</td>}
                    {pastCols.show('email') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.email || '—'}</td>}
                    {pastCols.show('street') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.street || '—'}</td>}
                    {pastCols.show('notes') && <td className="px-4 py-3 text-sm text-slate-600 max-w-[140px] truncate" title={c.notes}>{c.notes || '—'}</td>}
                    {pastCols.show('specialist') && (
                      <td className="px-4 py-3">
                        {c.specialist ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            {c.specialist}
                          </span>
                        ) : '—'}
                      </td>
                    )}
                    {pastCols.show('category') && <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.category || '—'}</td>}
                    {pastCols.show('active') && (
                      <td className="px-4 py-3 text-center">
                        <AddressActiveToggle active={c.active} onChange={() => {}} />
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AddressTableFooter total={filteredPast.length} page={1} onPageChange={() => {}} />
      </section>

      {confirmOpen && (
        <AddressConfirmInactiveModal onClose={closeInactiveFlow} onYes={() => { setConfirmOpen(false); setReasonOpen(true) }} onNo={closeInactiveFlow} />
      )}
      {reasonOpen && pendingContact && (
        <AddressReasonModal
          companyId={companyId}
          locationName={pendingContact.name || pendingContact.email || 'this contact'}
          notesHint="Contact names will be automatically included in your request"
          entityLabel="Contact"
          note={reasonNote}
          error={reasonError}
          onNoteChange={v => { setReasonNote(v); if (v.trim()) setReasonError(false) }}
          onSubmit={() => {
            if (!reasonNote.trim()) { setReasonError(true); return }
            setReasonOpen(false)
            setSuccessOpen(true)
          }}
          onCancel={closeInactiveFlow}
        />
      )}
      {successOpen && <AddressPendingSuccessModal onGotIt={closeInactiveFlow} />}
      {formMode && (
        <ContactFormModal
          key={`${formMode}-${editingContact?.id ?? 'new'}`}
          mode={formMode}
          companyId={companyId}
          initial={editingContact}
          onClose={closeForm}
          onSave={saveContact}
          onEdit={() => setFormMode('edit')}
        />
      )}
      {deleteConfirmId != null && (
        <AddressDeleteConfirmModal
          title="Delete contact"
          locationName={currentContacts.find(c => c.id === deleteConfirmId)?.name || currentContacts.find(c => c.id === deleteConfirmId)?.email || 'this contact'}
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={() => removeContact(deleteConfirmId)}
        />
      )}
    </div>
  )
}

function ContactPageField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  error,
  className = '',
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  error?: string
  className?: string
  readOnly?: boolean
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
        {label}{required && <span className="text-danger"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#12518c]/20 ${
          readOnly
            ? 'cursor-default border-slate-200 bg-slate-50 text-slate-600'
            : error
              ? 'border-danger bg-white text-slate-800 focus:border-danger'
              : 'border-slate-200 bg-white text-slate-800 focus:border-[#12518c]'
        }`}
      />
      {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
    </label>
  )
}

function ContactPageSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  required,
  error,
  readOnly = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  required?: boolean
  error?: string
  readOnly?: boolean
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
        {label}{required && <span className="text-danger"> *</span>}
      </span>
      <select
        value={value}
        disabled={readOnly}
        onChange={event => onChange(event.target.value)}
        className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-2 focus:ring-[#12518c]/20 ${
          readOnly
            ? 'cursor-default border-slate-200 bg-slate-50 text-slate-600'
            : error
              ? 'border-danger bg-white text-slate-700 focus:border-danger'
              : 'border-slate-200 bg-white text-slate-700 focus:border-[#12518c]'
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
      {error && <span className="mt-1 block text-[11px] text-danger">{error}</span>}
    </label>
  )
}

function AddContactSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#12518c]/10 text-[#12518c]">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function AddContactPage({
  companyId,
  companyName,
  onCancel,
  onSave,
}: {
  companyId: number
  companyName: string
  onCancel: () => void
  onSave: (data: Omit<ContactRow, 'id' | 'active' | 'cell'> & { id?: number; cell?: string }) => void
}) {
  const [contactType, setContactType] = useState<'Individual' | 'Shared Email'>('Individual')
  const [contactSource, setContactSource] = useState<'New' | 'Existing'>('New')
  const [form, setForm] = useState({
    existingContact: '',
    salutation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    nickname: '',
    alias: '',
    role: '',
    specialist: '',
    businessEmail: '',
    workPhone: '',
    extension: '',
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
    businessCountry: 'United States',
    personalEmail: '',
    cellPhone: '',
    personalStreet: '',
    personalCity: '',
    personalState: '',
    personalZip: '',
    personalCountry: 'United States',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (key: keyof typeof form, value: string) => {
    setForm(previous => ({ ...previous, [key]: value }))
    if (errors[key]) setErrors(previous => ({ ...previous, [key]: '' }))
  }

  const submit = () => {
    const nextErrors: Record<string, string> = {}
    if (contactSource === 'Existing') {
      if (!form.existingContact) nextErrors.existingContact = 'Select an existing contact.'
    } else if (contactType === 'Individual') {
      if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.'
      if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.'
    } else if (!form.firstName.trim()) {
      nextErrors.firstName = 'Contact name is required.'
    }
    if (!form.role.trim()) nextErrors.role = 'Role is required.'
    if (!form.businessEmail.trim() && !form.personalEmail.trim()) {
      nextErrors.businessEmail = 'Add at least one email address.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const enteredName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' ')
    onSave({
      name: contactSource === 'Existing' ? form.existingContact : enteredName,
      role: form.role.trim(),
      work: form.workPhone.trim(),
      email: (form.businessEmail || form.personalEmail).trim(),
      street: (form.businessStreet || form.personalStreet).trim(),
      notes: form.notes.trim(),
      specialist: form.specialist,
      category: contactType,
      cell: form.cellPhone.trim(),
    })
  }

  const addressIcon = (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5h12v8H3zM5 7.5V4h8v3.5M6 11h.01M9 11h.01M12 11h.01" />
    </svg>
  )

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Add Contact</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add a contact to <span className="font-medium text-slate-700">{companyName}</span>
            <span className="text-slate-300"> · </span>Company ID {companyId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={submit} className="h-9 rounded-lg bg-slate-700 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
            Save Contact
          </button>
        </div>
      </div>

      <AddContactSection
        title="Contact Information"
        description="Choose the contact type and enter their primary details."
        icon={
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="9" cy="6" r="3" />
            <path d="M3.5 16c0-3 2.4-5 5.5-5s5.5 2 5.5 5" />
          </svg>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 border-b border-slate-100 pb-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-medium text-slate-600">Type of contact <span className="text-danger">*</span></p>
              <div className="grid grid-cols-2 gap-2">
                {(['Individual', 'Shared Email'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setContactType(type)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      contactType === type ? 'border-[#12518c] bg-[#12518c]/5 ring-1 ring-[#12518c]/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className={`h-3.5 w-3.5 rounded-full border-4 ${contactType === type ? 'border-[#12518c]' : 'border-slate-300'}`} />
                      {type}
                    </span>
                    <span className="mt-1 block pl-5.5 text-[10px] leading-relaxed text-slate-500">
                      {type === 'Individual' ? 'A specific person at this company' : 'A company-level email, such as compliance@'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-medium text-slate-600">Contact source</p>
              <div className="grid grid-cols-2 gap-2">
                {(['New', 'Existing'] as const).map(source => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => setContactSource(source)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      contactSource === source ? 'border-[#12518c] bg-[#12518c]/5 ring-1 ring-[#12518c]/20' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className={`h-3.5 w-3.5 rounded-full border-4 ${contactSource === source ? 'border-[#12518c]' : 'border-slate-300'}`} />
                      {source}
                    </span>
                    <span className="mt-1 block pl-5.5 text-[10px] leading-relaxed text-slate-500">
                      {source === 'New' ? 'Create a new contact record' : 'Link a contact already in Cabinet'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {contactSource === 'Existing' ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <ContactPageSelect
                label="Existing Contact"
                required
                value={form.existingContact}
                onChange={value => set('existingContact', value)}
                options={[...new Set(COMPANY_CONTACTS.map(contact => contact.name).filter(Boolean))]}
                placeholder="Search for a contact…"
                error={errors.existingContact}
              />
              <ContactPageField label="Role" required value={form.role} onChange={value => set('role', value)} placeholder="e.g. Compliance Manager" error={errors.role} />
              <ContactPageSelect label="Specialist" value={form.specialist} onChange={value => set('specialist', value)} options={CONTACT_SPECIALIST_OPTIONS} />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ContactPageSelect label="Salutation" value={form.salutation} onChange={value => set('salutation', value)} options={['Mr.', 'Ms.', 'Mrs.', 'Dr.']} />
                <ContactPageField
                  label={contactType === 'Shared Email' ? 'Contact Name' : 'First Name'}
                  required
                  value={form.firstName}
                  onChange={value => set('firstName', value)}
                  placeholder={contactType === 'Shared Email' ? 'e.g. Compliance Team' : 'First name'}
                  error={errors.firstName}
                />
                <ContactPageField label="Middle Name" value={form.middleName} onChange={value => set('middleName', value)} placeholder="Middle name" />
                <ContactPageField label="Last Name" required={contactType === 'Individual'} value={form.lastName} onChange={value => set('lastName', value)} placeholder="Last name" error={errors.lastName} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ContactPageSelect label="Suffix" value={form.suffix} onChange={value => set('suffix', value)} options={['Jr.', 'Sr.', 'II', 'III', 'IV']} />
                <ContactPageField label="Nickname / Preferred Name" value={form.nickname} onChange={value => set('nickname', value)} placeholder="Preferred name" />
                <ContactPageField label="Alias / Former Name" value={form.alias} onChange={value => set('alias', value)} placeholder="Optional alias" />
                <ContactPageField label="Role" required value={form.role} onChange={value => set('role', value)} placeholder="e.g. Compliance Manager" error={errors.role} />
              </div>
              <div className="max-w-sm">
                <ContactPageSelect label="Specialist" value={form.specialist} onChange={value => set('specialist', value)} options={CONTACT_SPECIALIST_OPTIONS} />
              </div>
            </>
          )}
        </div>
      </AddContactSection>

      <AddContactSection title="Business Contact" description="Work contact information and business address." icon={addressIcon}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ContactPageField label="Business Email" required value={form.businessEmail} onChange={value => set('businessEmail', value)} type="email" placeholder="name@company.com" error={errors.businessEmail} />
            <ContactPageField label="Work / Office Phone" value={form.workPhone} onChange={value => set('workPhone', value)} placeholder="(000) 000-0000" />
            <ContactPageField label="Extension" value={form.extension} onChange={value => set('extension', value)} placeholder="Ext." />
          </div>
          <ContactPageField label="Street" value={form.businessStreet} onChange={value => set('businessStreet', value)} placeholder="Street address" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactPageField label="City" value={form.businessCity} onChange={value => set('businessCity', value)} />
            <ContactPageSelect label="State" value={form.businessState} onChange={value => set('businessState', value)} options={US_STATES} />
            <ContactPageField label="Zip Code" value={form.businessZip} onChange={value => set('businessZip', value)} />
            <ContactPageSelect label="Country" value={form.businessCountry} onChange={value => set('businessCountry', value)} options={['United States', 'Canada', 'Mexico']} />
          </div>
        </div>
      </AddContactSection>

      <AddContactSection title="Personal Contact" description="Optional personal contact details and mailing address." icon={addressIcon}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactPageField label="Personal Email" value={form.personalEmail} onChange={value => set('personalEmail', value)} type="email" placeholder="personal@email.com" />
            <ContactPageField label="Cell / Home Phone" value={form.cellPhone} onChange={value => set('cellPhone', value)} placeholder="(000) 000-0000" />
          </div>
          <ContactPageField label="Street" value={form.personalStreet} onChange={value => set('personalStreet', value)} placeholder="Street address" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactPageField label="City" value={form.personalCity} onChange={value => set('personalCity', value)} />
            <ContactPageSelect label="State" value={form.personalState} onChange={value => set('personalState', value)} options={US_STATES} />
            <ContactPageField label="Zip Code" value={form.personalZip} onChange={value => set('personalZip', value)} />
            <ContactPageSelect label="Country" value={form.personalCountry} onChange={value => set('personalCountry', value)} options={['United States', 'Canada', 'Mexico']} />
          </div>
          <label className="block pt-1">
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">Notes</span>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#12518c] focus-within:ring-2 focus-within:ring-[#12518c]/20">
              <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5 text-slate-500">
                {['B', 'I', 'U', '•', '1.', '↗'].map((tool, index) => (
                  <button key={`${tool}-${index}`} type="button" className={`h-7 min-w-7 rounded px-1.5 text-xs hover:bg-white hover:text-slate-800 ${tool === 'B' ? 'font-bold' : tool === 'I' ? 'italic' : tool === 'U' ? 'underline' : ''}`}>
                    {tool}
                  </button>
                ))}
              </div>
              <textarea
                value={form.notes}
                onChange={event => set('notes', event.target.value)}
                rows={5}
                placeholder="Add internal notes about this contact…"
                className="w-full resize-y border-0 px-3 py-2.5 text-sm text-slate-800 outline-none"
              />
            </div>
          </label>
        </div>
      </AddContactSection>

      <div className="flex items-center justify-end gap-2 pb-2">
        <button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={submit} className="h-9 rounded-lg bg-slate-700 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
          Save Contact
        </button>
      </div>
    </div>
  )
}

function splitContactName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', middleName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' }
  if (parts.length === 2) return { firstName: parts[0], middleName: '', lastName: parts[1] }
  return { firstName: parts[0], middleName: parts.slice(1, -1).join(' '), lastName: parts[parts.length - 1] }
}

function EditContactPage({
  companyId,
  companyName,
  contact,
  onCancel,
  onSave,
}: {
  companyId: number
  companyName: string
  contact: ContactRow
  onCancel: () => void
  onSave: (data: Omit<ContactRow, 'id' | 'active' | 'cell'> & { id?: number; cell?: string }) => void
}) {
  const nameParts = splitContactName(contact.name)
  const [contactType, setContactType] = useState<'Individual' | 'Shared Email'>(
    contact.category === 'Shared Email' ? 'Shared Email' : 'Individual'
  )
  const [form, setForm] = useState({
    salutation: '',
    firstName: nameParts.firstName,
    middleName: nameParts.middleName,
    lastName: nameParts.lastName,
    suffix: '',
    nickname: '',
    alias: '',
    role: contact.role,
    specialist: contact.specialist,
    businessEmail: contact.email,
    workPhone: contact.work,
    extension: '',
    businessStreet: contact.street,
    businessCity: '',
    businessState: '',
    businessZip: '',
    businessCountry: 'United States',
    personalEmail: contact.email,
    cellPhone: contact.cell === '—' ? '' : contact.cell,
    personalStreet: '',
    personalCity: '',
    personalState: '',
    personalZip: '',
    personalCountry: 'United States',
    notes: contact.notes,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const isIndividual = contactType === 'Individual'

  const set = (key: keyof typeof form, value: string) => {
    setForm(previous => ({ ...previous, [key]: value }))
    if (errors[key]) setErrors(previous => ({ ...previous, [key]: '' }))
  }

  const submit = () => {
    const nextErrors: Record<string, string> = {}
    if (!form.role.trim()) nextErrors.role = 'Role is required.'
    if (!form.businessEmail.trim()) nextErrors.businessEmail = 'Business email is required.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    onSave({
      id: contact.id,
      name: contact.name || [form.firstName, form.middleName, form.lastName].filter(Boolean).join(' '),
      role: form.role.trim(),
      work: form.workPhone.trim(),
      email: form.businessEmail.trim(),
      street: form.businessStreet.trim(),
      notes: form.notes.trim(),
      specialist: form.specialist,
      category: contactType,
      cell: form.cellPhone.trim(),
    })
  }

  const addressIcon = (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7.5h12v8H3zM5 7.5V4h8v3.5M6 11h.01M9 11h.01M12 11h.01" />
    </svg>
  )

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Edit Contact</h1>
          <p className="mt-1 text-sm text-slate-500">
            Edit contact for <span className="font-medium text-slate-700">{companyName}</span>
            <span className="text-slate-300"> · </span>Company ID {companyId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={submit} className="h-9 rounded-lg bg-slate-700 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
            Save
          </button>
        </div>
      </div>

      <AddContactSection
        title="Contact Information"
        description="Update company-level role and contact details."
        icon={
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="9" cy="6" r="3" />
            <path d="M3.5 16c0-3 2.4-5 5.5-5s5.5 2 5.5 5" />
          </svg>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[11px] font-medium text-slate-600">Type of contact <span className="text-danger">*</span></p>
            <div className="grid gap-2 sm:grid-cols-2">
              {(['Individual', 'Shared Email'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContactType(type)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    contactType === type ? 'border-[#12518c] bg-[#12518c]/5 ring-1 ring-[#12518c]/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <span className={`h-3.5 w-3.5 rounded-full border-4 ${contactType === type ? 'border-[#12518c]' : 'border-slate-300'}`} />
                    {type}
                  </span>
                  <span className="mt-1 block pl-5.5 text-[10px] leading-relaxed text-slate-500">
                    {type === 'Individual' ? 'A specific person at this company' : 'A company-level email, such as compliance@'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {isIndividual && (
            <div className="rounded-xl border border-[#e1c16e]/60 bg-[#e1c16e]/15 px-4 py-3 text-sm text-[#73591e]">
              Personal information can only be updated in the People module.
            </div>
          )}

          {isIndividual ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ContactPageSelect label="Salutation" value={form.salutation} onChange={value => set('salutation', value)} options={['Mr.', 'Ms.', 'Mrs.', 'Dr.']} readOnly />
                <ContactPageField label="First Name" required value={form.firstName} onChange={value => set('firstName', value)} readOnly />
                <ContactPageField label="Middle Name" value={form.middleName} onChange={value => set('middleName', value)} readOnly />
                <ContactPageField label="Last Name" required value={form.lastName} onChange={value => set('lastName', value)} readOnly />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <ContactPageSelect label="Suffix" value={form.suffix} onChange={value => set('suffix', value)} options={['Jr.', 'Sr.', 'II', 'III', 'IV']} readOnly />
                <ContactPageField label="Nickname / Preferred Name" value={form.nickname} onChange={value => set('nickname', value)} readOnly />
                <ContactPageField label="Alias / Former Name" value={form.alias} onChange={value => set('alias', value)} className="xl:col-span-2" readOnly />
              </div>
            </>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <ContactPageField label="Role" required value={form.role} onChange={value => set('role', value)} placeholder="e.g. Compliance Manager" error={errors.role} />
            <ContactPageSelect label="Specialist" value={form.specialist} onChange={value => set('specialist', value)} options={CONTACT_SPECIALIST_OPTIONS} />
          </div>
        </div>
      </AddContactSection>

      <AddContactSection title="Business Address" description="Company contact details for this person or shared inbox." icon={addressIcon}>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ContactPageField label="Email" required value={form.businessEmail} onChange={value => set('businessEmail', value)} type="email" error={errors.businessEmail} />
            <ContactPageField label="Work / Office Phone" value={form.workPhone} onChange={value => set('workPhone', value)} placeholder="(000) 000-0000" />
            <ContactPageField label="Extension" value={form.extension} onChange={value => set('extension', value)} placeholder="Ext." />
          </div>
          <ContactPageField label="Street" value={form.businessStreet} onChange={value => set('businessStreet', value)} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactPageField label="City" value={form.businessCity} onChange={value => set('businessCity', value)} />
            <ContactPageSelect label="State" value={form.businessState} onChange={value => set('businessState', value)} options={US_STATES} />
            <ContactPageField label="Zip Code" value={form.businessZip} onChange={value => set('businessZip', value)} />
            <ContactPageSelect label="Country" value={form.businessCountry} onChange={value => set('businessCountry', value)} options={['United States', 'Canada', 'Mexico']} />
          </div>
        </div>
      </AddContactSection>

      {isIndividual && (
        <AddContactSection title="Personal Address" description="Read-only personal details managed in People." icon={addressIcon}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactPageField label="Email" value={form.personalEmail} onChange={value => set('personalEmail', value)} type="email" readOnly />
              <ContactPageField label="Cell / Home Phone" value={form.cellPhone} onChange={value => set('cellPhone', value)} readOnly />
            </div>
            <ContactPageField label="Street" value={form.personalStreet} onChange={value => set('personalStreet', value)} readOnly />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ContactPageField label="City" value={form.personalCity} onChange={value => set('personalCity', value)} readOnly />
              <ContactPageSelect label="State" value={form.personalState} onChange={value => set('personalState', value)} options={US_STATES} readOnly />
              <ContactPageField label="Zip Code" value={form.personalZip} onChange={value => set('personalZip', value)} readOnly />
              <ContactPageSelect label="Country" value={form.personalCountry} onChange={value => set('personalCountry', value)} options={['United States', 'Canada', 'Mexico']} readOnly />
            </div>
          </div>
        </AddContactSection>
      )}

      <AddContactSection
        title="Notes"
        description="Internal notes for this company contact."
        icon={
          <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 3.5h10v11H4zM6.5 6.5h5M6.5 9h5M6.5 11.5h3" />
          </svg>
        }
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[#12518c] focus-within:ring-2 focus-within:ring-[#12518c]/20">
          <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5 text-slate-500">
            {['B', 'I', 'U', '•', '1.', '↗'].map((tool, index) => (
              <button key={`${tool}-${index}`} type="button" className={`h-7 min-w-7 rounded px-1.5 text-xs hover:bg-white hover:text-slate-800 ${tool === 'B' ? 'font-bold' : tool === 'I' ? 'italic' : tool === 'U' ? 'underline' : ''}`}>
                {tool}
              </button>
            ))}
          </div>
          <textarea
            value={form.notes}
            onChange={event => set('notes', event.target.value)}
            rows={5}
            placeholder="Add internal notes about this contact…"
            className="w-full resize-y border-0 px-3 py-2.5 text-sm text-slate-800 outline-none"
          />
        </div>
      </AddContactSection>

      <div className="flex items-center justify-end gap-2 pb-2">
        <button type="button" onClick={onCancel} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
          Cancel
        </button>
        <button type="button" onClick={submit} className="h-9 rounded-lg bg-slate-700 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800">
          Save
        </button>
      </div>
    </div>
  )
}

type OwnershipRow = {
  id: number
  name: string
  title: string
  ownershipPct: string
  effectiveDate: string
  cancellationDate: string
  principalType: 'person' | 'sub-company'
}

type PrincipalType = OwnershipRow['principalType']

function parseOwnershipPct(value: string) {
  const n = parseFloat(value.replace('%', '').trim())
  return Number.isFinite(n) ? n : 0
}

function OwnershipFormLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <span className="block text-[11px] font-medium text-slate-500 mb-1.5 leading-tight">
      {children}
      {required && <span className="text-[#bb5757]"> *</span>}
    </span>
  )
}

function OwnershipFormField({
  label,
  value,
  onChange,
  readOnly,
  placeholder,
  required,
  type = 'text',
  action,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  readOnly?: boolean
  placeholder?: string
  required?: boolean
  type?: string
  action?: ReactNode
}) {
  return (
    <label className="block min-w-0">
      <span className="flex items-center justify-between gap-2">
        <OwnershipFormLabel required={required}>{label}</OwnershipFormLabel>
        {action}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={`${detailControlClass} ${
          readOnly
            ? 'bg-slate-50/80 border-slate-200 text-slate-700 cursor-default'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      />
    </label>
  )
}

function OwnershipFormSelect({
  label,
  value,
  onChange,
  options,
  readOnly,
  placeholder = 'Select…',
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  readOnly?: boolean
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block min-w-0">
      <OwnershipFormLabel required={required}>{label}</OwnershipFormLabel>
      <select
        value={value}
        disabled={readOnly}
        onChange={e => onChange(e.target.value)}
        className={`${detailControlClass} appearance-none pr-8 bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat ${
          readOnly
            ? 'bg-slate-50/80 border-slate-200 text-slate-700 cursor-default'
            : 'bg-white border-slate-300 text-slate-900 cursor-pointer'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        }}
      >
        {!value && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  )
}

function OwnershipRadioGroup({
  label,
  value,
  onChange,
  options,
  readOnly,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  readOnly?: boolean
  required?: boolean
}) {
  return (
    <fieldset className="min-w-0">
      <OwnershipFormLabel required={required}>{label}</OwnershipFormLabel>
      <div className="flex flex-wrap gap-2 mt-0.5">
        {options.map(opt => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              disabled={readOnly}
              onClick={() => onChange(opt.value)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                selected
                  ? 'border-[#12518c] bg-[#12518c]/10 text-[#0e4173]'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              } ${readOnly ? 'cursor-default opacity-90' : ''}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selected ? 'border-[#12518c]' : 'border-slate-300'}`}>
                {selected && <span className="w-1.5 h-1.5 rounded-full bg-[#12518c]" />}
              </span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function OwnershipInfoTip({ title }: { title: string }) {
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold cursor-help" title={title}>
      i
    </span>
  )
}

function OwnershipFormSection({
  title,
  icon,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onToggle,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onToggle?: () => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen
  const toggle = onToggle ?? (() => setUncontrolledOpen(o => !o))
  return (
    <section className={`rounded-xl border overflow-hidden transition-colors ${open ? 'border-[#12518c]/25' : 'border-slate-200'}`}>
      <button
        type="button"
        onClick={toggle}
        className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
          open ? 'bg-[#12518c]/5 border-b border-[#12518c]/10' : 'bg-slate-50 hover:bg-slate-100/80'
        }`}
      >
        {icon && (
          <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0">
            {icon}
          </span>
        )}
        <span className={`flex-1 text-xs font-semibold uppercase tracking-wide ${open ? 'text-[#12518c]' : 'text-slate-500'}`}>
          {title}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${open ? 'rotate-180 text-[#12518c]' : 'text-slate-400'}`}>
          <path d="M3.5 5.25L7 8.75l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="p-4 bg-white space-y-4">{children}</div>}
    </section>
  )
}

function OwnershipQuestionRow({
  question,
  value,
  onChange,
  readOnly,
}: {
  question: string
  value: '' | 'yes' | 'no'
  onChange: (v: '' | 'yes' | 'no') => void
  readOnly?: boolean
}) {
  const opts: { v: '' | 'yes' | 'no'; label: string }[] = [
    { v: 'yes', label: 'Yes' },
    { v: 'no', label: 'No' },
    { v: '', label: 'Reset' },
  ]
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50">
      <p className="text-xs text-slate-700 mb-2.5 leading-relaxed">{question}</p>
      <div className="flex flex-wrap gap-2">
        {opts.map(opt => (
          <button
            key={opt.label}
            type="button"
            disabled={readOnly}
            onClick={() => onChange(opt.v)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
              value === opt.v
                ? 'border-[#12518c] bg-[#12518c]/10 text-[#0e4173]'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function OwnershipSaveBar({
  readOnly,
  onCancel,
  onSave,
  onEdit,
}: {
  readOnly?: boolean
  onCancel: () => void
  onSave: () => void
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      {readOnly ? (
        <>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            Close
          </button>
          {onEdit && (
            <button type="button" onClick={onEdit} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors">
              Edit
            </button>
          )}
        </>
      ) : (
        <>
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onSave} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors">
            Save
          </button>
        </>
      )}
    </div>
  )
}

type EmploymentRow = {
  id: number
  jobTitle: string
  company: string
  city: string
  from: string
  to: string
  current: boolean
}

function EmploymentFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial: EmploymentRow | null
  onClose: () => void
  onSave: (data: Omit<EmploymentRow, 'id'> & { id?: number }) => void
}) {
  const [errors, setErrors] = useState<Partial<Record<'jobTitle' | 'company' | 'city', boolean>>>({})
  const [form, setForm] = useState({
    id: initial?.id,
    jobTitle: initial?.jobTitle ?? '',
    company: initial?.company ?? '',
    city: initial?.city ?? '',
    from: initial?.from ?? '',
    to: initial?.to ?? '',
    current: initial?.current ?? false,
  })

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'current' && value === true) next.to = ''
      return next
    })
    if (key === 'jobTitle' || key === 'company' || key === 'city') {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleSave = () => {
    const next = {
      jobTitle: !form.jobTitle.trim(),
      company: !form.company.trim(),
      city: !form.city.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSave({
      id: form.id,
      jobTitle: form.jobTitle.trim(),
      company: form.company.trim(),
      city: form.city.trim(),
      from: form.from,
      to: form.current ? '' : form.to,
      current: form.current,
    })
  }

  return (
    <AddressModalShell maxWidth="max-w-lg" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Principal — {initial ? 'Edit Employment' : 'Add Employment'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            Save
          </button>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-4">
        <label className="block">
          <OwnershipFormLabel required>Job Title</OwnershipFormLabel>
          <input
            type="text"
            value={form.jobTitle}
            onChange={e => set('jobTitle', e.target.value)}
            className={`${detailControlClass} bg-white border-slate-300 text-slate-900 ${errors.jobTitle ? 'border-[#bb5757]' : ''}`}
          />
          {errors.jobTitle && <p className="mt-1 text-[11px] text-[#bb5757]">Job Title is required.</p>}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <OwnershipFormLabel required>Company</OwnershipFormLabel>
            <input
              type="text"
              value={form.company}
              onChange={e => set('company', e.target.value)}
              className={`${detailControlClass} bg-white border-slate-300 text-slate-900 ${errors.company ? 'border-[#bb5757]' : ''}`}
            />
            {errors.company && <p className="mt-1 text-[11px] text-[#bb5757]">Company is required.</p>}
          </label>
          <label className="block">
            <OwnershipFormLabel required>City</OwnershipFormLabel>
            <input
              type="text"
              value={form.city}
              onChange={e => set('city', e.target.value)}
              className={`${detailControlClass} bg-white border-slate-300 text-slate-900 ${errors.city ? 'border-[#bb5757]' : ''}`}
            />
            {errors.city && <p className="mt-1 text-[11px] text-[#bb5757]">City is required.</p>}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <OwnershipFormLabel>From</OwnershipFormLabel>
            <input
              type="date"
              value={form.from}
              onChange={e => set('from', e.target.value)}
              className={`${detailControlClass} bg-white border-slate-300 text-slate-900`}
            />
          </label>
          <label className="block">
            <OwnershipFormLabel>To</OwnershipFormLabel>
            <input
              type="date"
              value={form.to}
              disabled={form.current}
              onChange={e => set('to', e.target.value)}
              className={`${detailControlClass} ${
                form.current
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </label>
        </div>

        <label className="flex items-center gap-3 pt-1">
          <button
            type="button"
            role="switch"
            aria-checked={form.current}
            onClick={() => set('current', !form.current)}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.current ? 'bg-[#12518c]' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.current ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-sm text-slate-700">Current Employment</span>
        </label>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
        >
          Save
        </button>
      </div>
    </AddressModalShell>
  )
}

function AddOwnershipPage({
  companyName,
  companyId,
  mode,
  initial,
  onCancel,
  onSave,
  onEdit,
}: {
  companyName: string
  companyId: number
  mode: 'add' | 'edit' | 'view'
  initial: OwnershipRow | null
  onCancel: () => void
  onSave: (data: Omit<OwnershipRow, 'id'> & { id?: number }) => void
  onEdit?: () => void
}) {
  const readOnly = mode === 'view'
  const [principalType, setPrincipalType] = useState<PrincipalType>(initial?.principalType ?? 'person')
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const [personForm, setPersonForm] = useState({
    holdsOwnership: initial?.ownershipPct ? 'yes' : 'no',
    personMode: 'new',
    existingContact: '',
    sal: '',
    firstName: '',
    middleName: '',
    lastName: '',
    suffix: '',
    ttbPob: '',
    preferredName: initial?.principalType === 'person' ? (initial?.name ?? '') : '',
    alias: '',
    title: initial?.title ?? '',
    internalRemark: '',
    teamContact: 'no',
    email: '',
    workPhone: '',
    extension: '',
    cellPhone: '',
    homePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    ssn: '',
    dlNo: '',
    dlState: '',
    dob: '',
    placeOfBirth: '',
    usCitizen: false,
    height: '',
    weight: '',
    eyeColor: '',
    hairColor: '',
    ownershipPct: initial?.ownershipPct ?? '',
    effectiveDate: initial?.effectiveDate ?? '',
    cancellationDate: initial?.cancellationDate ?? '',
    q1: '' as '' | 'yes' | 'no',
    q2: '' as '' | 'yes' | 'no',
    q3: '' as '' | 'yes' | 'no',
    notes: '',
  })

  const [subForm, setSubForm] = useState({
    subMode: 'new',
    entityType: initial?.principalType === 'sub-company' ? 'LLC' : '',
    entityName: initial?.name ?? '',
    ein: '',
    phone: '',
    extension: '',
    fax: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    partnershipAgreementDate: '',
    originalState: '',
    originalSosNumber: '',
    originalFormationDate: '',
    originalAmendmentDate: '',
    title: initial?.title ?? '',
    ownershipPct: initial?.ownershipPct ?? '',
    effectiveDate: initial?.effectiveDate ?? '',
    cancellationDate: initial?.cancellationDate ?? '',
  })

  const [employments, setEmployments] = useState<EmploymentRow[]>([])
  const [employmentModalOpen, setEmploymentModalOpen] = useState(false)
  const [editingEmployment, setEditingEmployment] = useState<EmploymentRow | null>(null)

  const openAddEmployment = () => {
    setEditingEmployment(null)
    setEmploymentModalOpen(true)
  }

  const openEditEmployment = (row: EmploymentRow) => {
    setEditingEmployment(row)
    setEmploymentModalOpen(true)
  }

  const closeEmploymentModal = () => {
    setEmploymentModalOpen(false)
    setEditingEmployment(null)
  }

  const saveEmployment = (data: Omit<EmploymentRow, 'id'> & { id?: number }) => {
    if (data.id != null) {
      setEmployments(prev => prev.map(e => (e.id === data.id ? { ...e, ...data } as EmploymentRow : e)))
    } else {
      const nextId = Math.max(0, ...employments.map(e => e.id), 0) + 1
      setEmployments(prev => [...prev, { id: nextId, ...data } as EmploymentRow])
    }
    closeEmploymentModal()
  }

  const removeEmployment = (id: number) => {
    setEmployments(prev => prev.filter(e => e.id !== id))
  }

  const formatEmploymentDate = (value: string) => {
    if (!value) return '—'
    const d = new Date(`${value}T00:00:00`)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  }

  const setPerson = (key: keyof typeof personForm, value: string | boolean) => {
    setPersonForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: false }))
  }

  const setSub = (key: keyof typeof subForm, value: string) => {
    setSubForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: false }))
  }

  const pageTitle =
    mode === 'add' ? `Add Ownership to ${companyName}` : mode === 'edit' ? `Edit Ownership — ${companyName}` : `View Ownership — ${companyName}`

  const buildPersonName = () => {
    if (personForm.personMode === 'existing' && personForm.existingContact.trim()) {
      return personForm.existingContact.trim()
    }
    const parts = [personForm.sal, personForm.firstName, personForm.middleName, personForm.lastName, personForm.suffix].filter(Boolean)
    const full = parts.join(' ').trim()
    if (personForm.preferredName.trim()) return personForm.preferredName.trim()
    return full || personForm.alias.trim() || 'Unnamed Person'
  }

  const handleSave = () => {
    const next: Record<string, boolean> = {}
    if (principalType === 'person') {
      if (personForm.personMode === 'existing') {
        if (!personForm.existingContact.trim()) next.existingContact = true
      } else {
        if (!personForm.firstName.trim()) next.firstName = true
        if (!personForm.lastName.trim()) next.lastName = true
      }
      if (personForm.holdsOwnership === 'yes') {
        if (!personForm.ownershipPct.trim()) next.ownershipPct = true
        if (!personForm.effectiveDate.trim()) next.effectiveDate = true
      }
    } else {
      if (!subForm.entityType.trim()) next.entityType = true
      if (!subForm.entityName.trim()) next.entityName = true
      if (!subForm.ownershipPct.trim()) next.ownershipPct = true
      if (!subForm.effectiveDate.trim()) next.effectiveDate = true
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return

    if (principalType === 'person') {
      onSave({
        id: initial?.id,
        name: buildPersonName(),
        title: personForm.title,
        ownershipPct: personForm.holdsOwnership === 'yes' ? personForm.ownershipPct : '',
        effectiveDate: personForm.holdsOwnership === 'yes' ? personForm.effectiveDate : '',
        cancellationDate: personForm.holdsOwnership === 'yes' ? personForm.cancellationDate : '',
        principalType: 'person',
      })
    } else {
      onSave({
        id: initial?.id,
        name: subForm.entityName.trim(),
        title: subForm.title,
        ownershipPct: subForm.ownershipPct,
        effectiveDate: subForm.effectiveDate,
        cancellationDate: subForm.cancellationDate,
        principalType: 'sub-company',
      })
    }
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <div className="sticky top-[52px] z-[5] -mx-0 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm px-5 py-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">{pageTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Company ID {companyId}</p>
          </div>
          <OwnershipSaveBar readOnly={readOnly} onCancel={onCancel} onSave={handleSave} onEdit={onEdit} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <OwnershipFormSection title="Principal Configuration" defaultOpen icon={
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1.5l1.5 3 3.3.5-2.4 2.3.6 3.3L8 9.2 5 10.6l.6-3.3L3.2 5l3.3-.5L8 1.5z" strokeLinejoin="round" /></svg>
        }>
          <div className={`grid gap-4 ${principalType === 'person' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            <OwnershipRadioGroup
              label="Type of Principal"
              required
              value={principalType}
              onChange={v => !readOnly && setPrincipalType(v as PrincipalType)}
              readOnly={readOnly || mode === 'edit'}
              options={[
                { value: 'person', label: 'Person' },
                { value: 'sub-company', label: 'Sub-Company' },
              ]}
            />
            {principalType === 'person' && (
              <OwnershipRadioGroup
                label="Does this person hold Ownership in the company?"
                value={personForm.holdsOwnership}
                onChange={v => setPerson('holdsOwnership', v)}
                readOnly={readOnly}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
            )}
          </div>
        </OwnershipFormSection>

        {principalType === 'person' ? (
          <>
            <OwnershipFormSection title="Person Information" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5.5" r="2.5" /><path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" /></svg>
            }>
              <OwnershipRadioGroup
                label="Person"
                value={personForm.personMode}
                onChange={v => setPerson('personMode', v)}
                readOnly={readOnly}
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'existing', label: 'Existing' },
                ]}
              />
              {personForm.personMode === 'existing' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <OwnershipFormSelect
                      label="Search for a Contact"
                      required
                      value={personForm.existingContact}
                      onChange={v => setPerson('existingContact', v)}
                      readOnly={readOnly}
                      options={[...new Set(COMPANY_CONTACTS.map(c => c.name).filter(Boolean))]}
                      placeholder="Search for a Contact…"
                    />
                    {errors.existingContact && <p className="mt-1 text-[11px] text-[#bb5757]">Please select a contact.</p>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                    <OwnershipFormSelect label="Sal" value={personForm.sal} onChange={v => setPerson('sal', v)} readOnly={readOnly} options={['Mr', 'Mrs', 'Ms', 'Dr', 'Prof']} />
                    <div>
                      <OwnershipFormField label="First Name" required value={personForm.firstName} onChange={v => setPerson('firstName', v)} readOnly={readOnly} />
                      {errors.firstName && <p className="mt-1 text-[11px] text-[#bb5757]">Required</p>}
                    </div>
                    <OwnershipFormField label="Middle Name" value={personForm.middleName} onChange={v => setPerson('middleName', v)} readOnly={readOnly} />
                    <div>
                      <OwnershipFormField label="Last Name" required value={personForm.lastName} onChange={v => setPerson('lastName', v)} readOnly={readOnly} />
                      {errors.lastName && <p className="mt-1 text-[11px] text-[#bb5757]">Required</p>}
                    </div>
                    <OwnershipFormSelect label="Suffix" value={personForm.suffix} onChange={v => setPerson('suffix', v)} readOnly={readOnly} options={['Jr', 'Sr', 'II', 'III', 'IV']} />
                    <OwnershipFormField label="TTB POB" value={personForm.ttbPob} onChange={v => setPerson('ttbPob', v)} readOnly={readOnly} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <OwnershipFormField label="Preferred Name" value={personForm.preferredName} onChange={v => setPerson('preferredName', v)} readOnly={readOnly} action={<OwnershipInfoTip title="Name used on labels and correspondence" />} />
                    <OwnershipFormField label="Alias" value={personForm.alias} onChange={v => setPerson('alias', v)} readOnly={readOnly} action={<OwnershipInfoTip title="Alternate or legal alias" />} />
                    <OwnershipFormField label="Title" value={personForm.title} onChange={v => setPerson('title', v)} readOnly={readOnly} />
                    <OwnershipFormField label="Internal Remark" value={personForm.internalRemark} onChange={v => setPerson('internalRemark', v)} readOnly={readOnly} />
                  </div>
                </>
              )}
            </OwnershipFormSection>

            <OwnershipFormSection title="Team Contact" defaultOpen={false} icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4h12v8H2z" /><path d="M2 6l6 4 6-4" /></svg>
            }>
              <OwnershipRadioGroup
                label="Is this a Team Contact?"
                value={personForm.teamContact}
                onChange={v => setPerson('teamContact', v)}
                readOnly={readOnly}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
              />
            </OwnershipFormSection>

            <OwnershipFormSection title="Contact Information" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 2.5h4l1 2.5H13v9H3z" /><circle cx="8" cy="9" r="2" /></svg>
            }>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <OwnershipFormField label="Email" value={personForm.email} onChange={v => setPerson('email', v)} readOnly={readOnly} type="email" />
                <OwnershipFormField label="Work Phone" value={personForm.workPhone} onChange={v => setPerson('workPhone', v)} readOnly={readOnly} />
                <OwnershipFormField label="Extension" value={personForm.extension} onChange={v => setPerson('extension', v)} readOnly={readOnly} />
                <OwnershipFormField label="Cell Phone" value={personForm.cellPhone} onChange={v => setPerson('cellPhone', v)} readOnly={readOnly} />
                <OwnershipFormField label="Home Phone" value={personForm.homePhone} onChange={v => setPerson('homePhone', v)} readOnly={readOnly} />
              </div>
              <OwnershipFormField label="Street" value={personForm.street} onChange={v => setPerson('street', v)} readOnly={readOnly} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <OwnershipFormField label="City" value={personForm.city} onChange={v => setPerson('city', v)} readOnly={readOnly} />
                <OwnershipFormSelect label="State" value={personForm.state} onChange={v => setPerson('state', v)} readOnly={readOnly} options={US_STATES} />
                <OwnershipFormField label="Zip Code" value={personForm.zipCode} onChange={v => setPerson('zipCode', v)} readOnly={readOnly} />
                <OwnershipFormSelect label="Country" value={personForm.country} onChange={v => setPerson('country', v)} readOnly={readOnly} options={['United States', 'Canada', 'Mexico']} />
              </div>
            </OwnershipFormSection>

            <OwnershipFormSection title="Personal Information" defaultOpen={false} icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="3" width="12" height="10" rx="1" /><path d="M5 7h6M5 10h4" /></svg>
            }>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <OwnershipFormField label="Social Security Number" value={personForm.ssn} onChange={v => setPerson('ssn', v)} readOnly={readOnly} placeholder="XXX-XX-XXXX" />
                <OwnershipFormField label="Driver's License No" value={personForm.dlNo} onChange={v => setPerson('dlNo', v)} readOnly={readOnly} />
                <OwnershipFormSelect label="State Issued" value={personForm.dlState} onChange={v => setPerson('dlState', v)} readOnly={readOnly} options={US_STATES} />
                <OwnershipFormField label="Date of Birth" value={personForm.dob} onChange={v => setPerson('dob', v)} readOnly={readOnly} placeholder="MM/DD/YYYY" type="date" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <OwnershipFormField label="Place of Birth" value={personForm.placeOfBirth} onChange={v => setPerson('placeOfBirth', v)} readOnly={readOnly} />
                <label className="block">
                  <OwnershipFormLabel>US Citizen</OwnershipFormLabel>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={personForm.usCitizen}
                    disabled={readOnly}
                    onClick={() => setPerson('usCitizen', !personForm.usCitizen)}
                    className={`relative w-10 h-5 rounded-full transition-colors mt-1 ${personForm.usCitizen ? 'bg-[#12518c]' : 'bg-slate-300'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${personForm.usCitizen ? 'translate-x-5' : ''}`} />
                  </button>
                </label>
                <OwnershipFormField label="Height" value={personForm.height} onChange={v => setPerson('height', v)} readOnly={readOnly} />
                <OwnershipFormField label="Weight" value={personForm.weight} onChange={v => setPerson('weight', v)} readOnly={readOnly} />
                <OwnershipFormField label="Eye Color" value={personForm.eyeColor} onChange={v => setPerson('eyeColor', v)} readOnly={readOnly} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <OwnershipFormField label="Hair Color" value={personForm.hairColor} onChange={v => setPerson('hairColor', v)} readOnly={readOnly} />
              </div>
            </OwnershipFormSection>

            <OwnershipFormSection title="Employment Information" defaultOpen={false} icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="4" width="12" height="9" rx="1" /><path d="M6 4V3a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" /></svg>
            }>
              <button
                type="button"
                disabled={readOnly}
                onClick={openAddEmployment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2.5v7M2.5 6h7" /></svg>
                Add Employment
              </button>

              {employments.length === 0 ? (
                <p className="text-xs text-slate-400">No employment records added yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        {['Job Title', 'Company', 'City', 'From', 'To', 'Current', 'Actions'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {employments.map((e, i) => (
                        <tr key={e.id} className={`border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                          <td className="px-3 py-2.5 text-sm text-slate-800">{e.jobTitle}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-600">{e.company}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-600">{e.city}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-600 whitespace-nowrap">{formatEmploymentDate(e.from)}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-600 whitespace-nowrap">{e.current ? '—' : formatEmploymentDate(e.to)}</td>
                          <td className="px-3 py-2.5">
                            {e.current ? (
                              <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">Current</span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <button type="button" onClick={() => openEditEmployment(e)} disabled={readOnly} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50" title="Edit">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                                  <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                                </svg>
                              </button>
                              <button type="button" onClick={() => removeEmployment(e.id)} disabled={readOnly} className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors disabled:opacity-50" title="Delete">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </OwnershipFormSection>

            {personForm.holdsOwnership === 'yes' && (
              <OwnershipFormSection title="Ownership Details" icon={
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 2v12M4 6h8M4 10h8" /></svg>
              }>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <OwnershipFormField label="Title" value={personForm.title} onChange={v => setPerson('title', v)} readOnly={readOnly} />
                  <OwnershipFormField label="Ownership %" required value={personForm.ownershipPct} onChange={v => setPerson('ownershipPct', v)} readOnly={readOnly} />
                  <OwnershipFormField label="Effective Date" required value={personForm.effectiveDate} onChange={v => setPerson('effectiveDate', v)} readOnly={readOnly} placeholder="MM-DD-YYYY" type="date" />
                  <OwnershipFormField label="Cancellation Date" value={personForm.cancellationDate} onChange={v => setPerson('cancellationDate', v)} readOnly={readOnly} placeholder="MM-DD-YYYY" type="date" />
                </div>
                {(errors.ownershipPct || errors.effectiveDate) && (
                  <p className="text-[11px] text-[#bb5757]">Ownership % and Effective Date are required when the person holds ownership.</p>
                )}
              </OwnershipFormSection>
            )}

            <OwnershipFormSection title="Questionnaire" defaultOpen={false} icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6" /><path d="M6.2 6.2a1.8 1.8 0 0 1 3.3 1c0 1.2-1.5 1.5-1.5 2.8M8 11.5h.01" strokeLinecap="round" /></svg>
            }>
              <div className="space-y-3">
                <OwnershipQuestionRow
                  question="Have you ever held a federal or state basic permit or license to manufacture, import, or sell beverage alcohol that was revoked, suspended, or denied?"
                  value={personForm.q1}
                  onChange={v => setPerson('q1', v)}
                  readOnly={readOnly}
                />
                <OwnershipQuestionRow
                  question="Have you ever been convicted of a felony or misdemeanor under federal or state law relating to beverage alcohol?"
                  value={personForm.q2}
                  onChange={v => setPerson('q2', v)}
                  readOnly={readOnly}
                />
                <OwnershipQuestionRow
                  question="Are you presently involved in any legal proceedings that could affect your suitability as an owner or principal?"
                  value={personForm.q3}
                  onChange={v => setPerson('q3', v)}
                  readOnly={readOnly}
                />
              </div>
              <label className="block mt-4">
                <OwnershipFormLabel>Notes</OwnershipFormLabel>
                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
                    {['B', 'I', 'U', '•', '1.'].map(btn => (
                      <button key={btn} type="button" disabled={readOnly} className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-500 hover:bg-white disabled:opacity-50">{btn}</button>
                    ))}
                  </div>
                  <textarea
                    value={personForm.notes}
                    readOnly={readOnly}
                    onChange={e => setPerson('notes', e.target.value)}
                    rows={4}
                    placeholder="Additional notes…"
                    className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y min-h-[96px]"
                  />
                </div>
              </label>
            </OwnershipFormSection>
          </>
        ) : (
          <>
            <OwnershipFormSection title="Sub-Company Information" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 13V5l6-3 6 3v8" /><path d="M6 13V9h4v4" /></svg>
            }>
              <OwnershipRadioGroup
                label="Sub-Company"
                value={subForm.subMode}
                onChange={v => setSub('subMode', v)}
                readOnly={readOnly}
                options={[
                  { value: 'new', label: 'New' },
                  { value: 'existing', label: 'Existing' },
                ]}
              />
              <OwnershipFormSelect label="Entity Type" required value={subForm.entityType} onChange={v => setSub('entityType', v)} readOnly={readOnly} options={['LLC', 'Corporation', 'Partnership', 'LP', 'LLP']} />
              {errors.entityType && <p className="text-[11px] text-[#bb5757] -mt-2">Entity Type is required.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <OwnershipFormField label="Entity Name" required value={subForm.entityName} onChange={v => setSub('entityName', v)} readOnly={readOnly} />
                <OwnershipFormField label="EIN" value={subForm.ein} onChange={v => setSub('ein', v)} readOnly={readOnly} placeholder="XX-XXXXXXX" />
              </div>
              {errors.entityName && <p className="text-[11px] text-[#bb5757] -mt-2">Entity Name is required.</p>}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <OwnershipFormField label="Phone" value={subForm.phone} onChange={v => setSub('phone', v)} readOnly={readOnly} />
                <OwnershipFormField label="Extension" value={subForm.extension} onChange={v => setSub('extension', v)} readOnly={readOnly} />
                <OwnershipFormField label="Fax" value={subForm.fax} onChange={v => setSub('fax', v)} readOnly={readOnly} />
              </div>
              <OwnershipFormField label="Street" value={subForm.street} onChange={v => setSub('street', v)} readOnly={readOnly} />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <OwnershipFormField label="City" value={subForm.city} onChange={v => setSub('city', v)} readOnly={readOnly} />
                <OwnershipFormSelect label="State" value={subForm.state} onChange={v => setSub('state', v)} readOnly={readOnly} options={US_STATES} />
                <OwnershipFormField label="Zip Code" value={subForm.zipCode} onChange={v => setSub('zipCode', v)} readOnly={readOnly} />
                <OwnershipFormSelect label="Country" value={subForm.country} onChange={v => setSub('country', v)} readOnly={readOnly} options={['United States', 'Canada', 'Mexico']} />
              </div>
              <OwnershipFormField label="Partnership Agreement Date" value={subForm.partnershipAgreementDate} onChange={v => setSub('partnershipAgreementDate', v)} readOnly={readOnly} type="date" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <OwnershipFormSelect label="Original State of Formation" value={subForm.originalState} onChange={v => setSub('originalState', v)} readOnly={readOnly} options={US_STATES} />
                <OwnershipFormField label="Original Secretary of State number" value={subForm.originalSosNumber} onChange={v => setSub('originalSosNumber', v)} readOnly={readOnly} />
                <OwnershipFormField label="Original Formation Date" value={subForm.originalFormationDate} onChange={v => setSub('originalFormationDate', v)} readOnly={readOnly} type="date" />
                <OwnershipFormField label="Original Amendment Date" value={subForm.originalAmendmentDate} onChange={v => setSub('originalAmendmentDate', v)} readOnly={readOnly} type="date" />
              </div>
            </OwnershipFormSection>

            <OwnershipFormSection title="Sub-Company Ownership Information" icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 3v10M4 7h8M4 11h5" /></svg>
            }>
              <OwnershipFormField label="Title" value={subForm.title} onChange={v => setSub('title', v)} readOnly={readOnly} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <OwnershipFormField label="Ownership %" required value={subForm.ownershipPct} onChange={v => setSub('ownershipPct', v)} readOnly={readOnly} />
                <OwnershipFormField label="Effective Date" required value={subForm.effectiveDate} onChange={v => setSub('effectiveDate', v)} readOnly={readOnly} type="date" />
                <OwnershipFormField label="Cancellation Date" value={subForm.cancellationDate} onChange={v => setSub('cancellationDate', v)} readOnly={readOnly} type="date" />
              </div>
              {(errors.ownershipPct || errors.effectiveDate) && (
                <p className="text-[11px] text-[#bb5757]">Ownership % and Effective Date are required.</p>
              )}
            </OwnershipFormSection>

            <OwnershipFormSection title="Principal" defaultOpen={false} icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 4h10v9H3z" /><path d="M6 2h4v2H6z" /></svg>
            }>
              <button
                type="button"
                disabled={readOnly}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors disabled:opacity-60"
              >
                Add Principal
              </button>
              <p className="text-xs text-slate-400">Link principals associated with this sub-company entity.</p>
            </OwnershipFormSection>
          </>
        )}
      </div>

      {employmentModalOpen && (
        <EmploymentFormModal
          key={editingEmployment?.id ?? 'new'}
          initial={editingEmployment}
          onClose={closeEmploymentModal}
          onSave={saveEmployment}
        />
      )}
    </div>
  )
}

function CompanyOwnershipPage({
  companyId,
  companyName,
  subPage,
  onSubPageChange,
}: {
  companyId: number
  companyName: string
  subPage: string | null
  onSubPageChange: (subPage: string | null) => void
}) {
  const [owners, setOwners] = useState<OwnershipRow[]>(COMPANY_OWNERSHIP)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add')
  const [editingOwner, setEditingOwner] = useState<OwnershipRow | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [variationOwner, setVariationOwner] = useState<OwnershipRow | null>(null)

  const screen = subPage ? 'form' : 'list'

  const filtered = owners.filter(o =>
    !search ||
    [o.name, o.title, o.ownershipPct, o.effectiveDate, o.cancellationDate, o.principalType].some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalOwnershipPct = owners.reduce((sum, o) => sum + parseOwnershipPct(o.ownershipPct), 0)

  const openAdd = () => {
    setEditingOwner(null)
    setFormMode('add')
    onSubPageChange('Add Ownership')
  }

  const openView = (owner: OwnershipRow) => {
    setEditingOwner(owner)
    setFormMode('view')
    onSubPageChange('View Ownership')
  }

  const openEdit = (owner: OwnershipRow) => {
    setEditingOwner(owner)
    setFormMode('edit')
    onSubPageChange('Edit Ownership')
  }

  const closeForm = () => {
    setEditingOwner(null)
    onSubPageChange(null)
  }

  const saveOwner = (data: Omit<OwnershipRow, 'id'> & { id?: number }) => {
    if (formMode === 'edit' && data.id != null) {
      setOwners(prev => prev.map(o => (o.id === data.id ? { ...o, ...data } : o)))
    } else {
      const nextId = Math.max(0, ...owners.map(o => o.id)) + 1
      setOwners(prev => [{ id: nextId, ...data } as OwnershipRow, ...prev])
    }
    closeForm()
  }

  const removeOwner = (id: number) => {
    setOwners(prev => prev.filter(o => o.id !== id))
    setDeleteConfirmId(null)
  }

  const saveVariation = (data: {
    department: string
    label: string
    principalType: PrincipalType
    holdsOwnership: string
    personProfileType: string
  }) => {
    if (!variationOwner) return
    const nextId = Math.max(0, ...owners.map(o => o.id)) + 1
    const displayName = data.label.trim()
      ? `${variationOwner.name} — ${data.label.trim()}`
      : `${variationOwner.name} (Variation)`
    setOwners(prev => [
      {
        id: nextId,
        name: displayName,
        title: variationOwner.title,
        ownershipPct: data.holdsOwnership === 'yes' || data.principalType === 'sub-company' ? variationOwner.ownershipPct : '',
        effectiveDate: data.holdsOwnership === 'yes' || data.principalType === 'sub-company' ? variationOwner.effectiveDate : '',
        cancellationDate: variationOwner.cancellationDate,
        principalType: data.principalType,
      },
      ...prev,
    ])
    setVariationOwner(null)
  }

  if (screen === 'form') {
    return (
      <AddOwnershipPage
        companyName={companyName}
        companyId={companyId}
        mode={formMode}
        initial={editingOwner}
        onCancel={closeForm}
        onSave={saveOwner}
        onEdit={() => {
          setFormMode('edit')
          onSubPageChange('Edit Ownership')
        }}
      />
    )
  }

  const columns = ['Name', 'Type', 'Title', 'Ownership %', 'Effective Date', 'Cancellation Date', 'Actions'] as const

  return (
    <div className="animate-[fadeIn_0.25s_ease-out]">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#12518c]">Ownership</h2>
              <p className="text-xs text-slate-500">Owners and equity holders for this company</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
              Total Ownership %:
              <span className="text-[#12518c]">{totalOwnershipPct.toFixed(2)}</span>
            </span>
            <AddressSearchInput value={search} onChange={setSearch} />
            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              title="Column settings"
            >
              <GridViewIcon />
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {columns.map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i === columns.length - 1 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">No record Found!</td>
                </tr>
              ) : (
                filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{o.name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                        o.principalType === 'sub-company'
                          ? 'bg-[#12518c]/10 text-[#12518c]'
                          : 'bg-violet-50 text-violet-700'
                      }`}>
                        {o.principalType === 'sub-company' ? 'Sub-Co' : 'Person'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{o.title || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 tabular-nums">
                      {o.ownershipPct ? `${o.ownershipPct.replace('%', '')}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{o.effectiveDate || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{o.cancellationDate || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <button type="button" onClick={() => openView(o)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="View">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                            <circle cx="8" cy="8" r="1.75" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => openEdit(o)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVariationOwner(o)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                          title="Add Variation"
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
                            <path d="M10.5 5.5V4.2A1.2 1.2 0 0 0 9.3 3H4.2A1.2 1.2 0 0 0 3 4.2v5.1A1.2 1.2 0 0 0 4.2 10.5H5.5" />
                            <path d="M9.5 8.5v3M8 10h3" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeleteConfirmId(o.id)} className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors" title="Delete">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>

      {deleteConfirmId != null && (
        <AddressDeleteConfirmModal
          title="Delete ownership record"
          locationName={owners.find(o => o.id === deleteConfirmId)?.name || 'this record'}
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={() => removeOwner(deleteConfirmId)}
        />
      )}
      {variationOwner && (
        <OwnershipVariationModal
          owner={variationOwner}
          onClose={() => setVariationOwner(null)}
          onSave={saveVariation}
        />
      )}
    </div>
  )
}

function OwnershipVariationModal({
  owner,
  onClose,
  onSave,
}: {
  owner: OwnershipRow
  onClose: () => void
  onSave: (data: {
    department: string
    label: string
    principalType: PrincipalType
    holdsOwnership: string
    personProfileType: string
  }) => void
}) {
  const [errors, setErrors] = useState<Partial<Record<'department' | 'label' | 'personProfileType', boolean>>>({})
  const [form, setForm] = useState({
    department: '',
    label: '',
    principalType: owner.principalType as PrincipalType,
    holdsOwnership: owner.ownershipPct ? 'yes' : 'no',
    personProfileType: '',
  })

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'department' || key === 'label' || key === 'personProfileType') {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleSave = () => {
    const next = {
      department: !form.department.trim(),
      label: !form.label.trim(),
      personProfileType: form.principalType === 'person' && !form.personProfileType.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSave(form)
  }

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.2" />
              <path d="M10.5 5.5V4.2A1.2 1.2 0 0 0 9.3 3H4.2A1.2 1.2 0 0 0 3 4.2v5.1A1.2 1.2 0 0 0 4.2 10.5H5.5" />
              <path d="M9.5 8.5v3M8 10h3" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Add Ownership Variation</h3>
            <p className="text-[11px] text-slate-500">Create a departmental variation of an existing ownership record</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Base record context */}
        <div className="flex items-center gap-3 rounded-xl border border-[#12518c]/20 bg-[#12518c]/5 px-4 py-3">
          <span className="w-8 h-8 rounded-full bg-white border border-[#12518c]/25 text-[#12518c] flex items-center justify-center text-xs font-bold flex-shrink-0">
            {owner.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{owner.name}</p>
            <p className="text-[11px] text-slate-500">
              {owner.principalType === 'sub-company' ? 'Sub-Company' : 'Person'}
              {owner.title ? ` · ${owner.title}` : ''}
              {owner.ownershipPct ? ` · ${owner.ownershipPct.replace('%', '')}% ownership` : ''}
            </p>
          </div>
        </div>

        {/* Variation details */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Variation Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <OwnershipFormSelect
                label="Department"
                required
                value={form.department}
                onChange={v => set('department', v)}
                options={['OOS', 'OPS']}
                placeholder="Select…"
              />
              {errors.department && <p className="mt-1 text-[11px] text-[#bb5757]">Department is required.</p>}
            </div>
            <div>
              <OwnershipFormField
                label="Label"
                required
                value={form.label}
                onChange={v => set('label', v)}
                placeholder="e.g. DTC Filing Name"
              />
              {errors.label && <p className="mt-1 text-[11px] text-[#bb5757]">Label is required.</p>}
            </div>
          </div>
        </div>

        {/* Principal configuration */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Principal Configuration</p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OwnershipRadioGroup
                label="Type of Principal"
                required
                value={form.principalType}
                onChange={v => set('principalType', v)}
                options={[
                  { value: 'person', label: 'Person' },
                  { value: 'sub-company', label: 'Sub-Company' },
                ]}
              />
              {form.principalType === 'person' && (
                <OwnershipRadioGroup
                  label="Holds Ownership in the company?"
                  value={form.holdsOwnership}
                  onChange={v => set('holdsOwnership', v)}
                  options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ]}
                />
              )}
            </div>
            {form.principalType === 'person' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <OwnershipFormSelect
                    label="Person Profile Type"
                    required
                    value={form.personProfileType}
                    onChange={v => set('personProfileType', v)}
                    options={['Owner', 'Officer', 'Director', 'Manager', 'Member', 'Partner']}
                    placeholder="Select…"
                  />
                  {errors.personProfileType && <p className="mt-1 text-[11px] text-[#bb5757]">Person Profile Type is required.</p>}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2.5">
                Sub-company variations use the entity profile settings — no person profile type is needed.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
        >
          Save Variation
        </button>
      </div>
    </AddressModalShell>
  )
}

function ReportSecretCell({ value, label }: { value: string; label: string }) {
  const [revealed, setRevealed] = useState(false)

  if (!value) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="group inline-flex min-w-[72px] items-center gap-1.5">
      <span className="font-mono text-sm text-slate-500">
        {revealed ? value : '•'.repeat(Math.min(Math.max(value.length, 4), 8))}
      </span>
      <button
        type="button"
        onClick={() => setRevealed(current => !current)}
        className={`rounded-md p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-[#12518c] ${
          revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
        title={revealed ? `Hide ${label}` : `Show ${label}`}
      >
        {revealed ? (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M2 2l12 12M6.5 6.7A3 3 0 0 0 8 11a3 3 0 0 0 2.9-2.2M4.2 4.3C2.7 5.4 1.5 7 1.5 8s2.5 4.5 6.5 4.5c1.1 0 2.1-.3 3-.8M11 5.5A3 3 0 0 1 12.5 8" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
            <circle cx="8" cy="8" r="2" />
          </svg>
        )}
      </button>
    </div>
  )
}

function CompanyLicensesPage({ companyId }: { companyId: number }) {
  type LicenseRow = (typeof COMPANY_LICENSES)[number]
  type ReportRow = (typeof COMPANY_REPORTING)[number]
  type SubTab = 'Licensing Summary' | 'Reporting Summary'

  const [subTab, setSubTab] = useState<SubTab>('Licensing Summary')
  const [licenses, setLicenses] = useState<LicenseRow[]>(COMPANY_LICENSES)
  const [pastReports] = useState<ReportRow[]>(PAST_REPORTING)
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [funcFilter, setFuncFilter] = useState('')
  const [itemFilter, setItemFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [renewalFilter, setRenewalFilter] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [reportPage, setReportPage] = useState(1)
  const [reportStateFilter, setReportStateFilter] = useState('')
  const [reportFuncFilter, setReportFuncFilter] = useState('')
  const [reportTypeFilter, setReportTypeFilter] = useState('')
  const [reportFilingTypeFilter, setReportFilingTypeFilter] = useState('')
  const [reportFreqFilter, setReportFreqFilter] = useState('')
  const [reportDueFilter, setReportDueFilter] = useState('')
  const [pastSearch, setPastSearch] = useState('')
  const [pastReportsOpen, setPastReportsOpen] = useState(true)
  const [reportRows, setReportRows] = useState<ReportRow[]>(COMPANY_REPORTING)
  const [addReportOpen, setAddReportOpen] = useState(false)
  const [viewReport, setViewReport] = useState<ReportRow | null>(null)
  const [editReport, setEditReport] = useState<ReportRow | null>(null)
  const [deleteReportId, setDeleteReportId] = useState<number | null>(null)
  const [viewLicense, setViewLicense] = useState<LicenseRow | null>(null)
  const [editLicense, setEditLicense] = useState<LicenseRow | null>(null)
  const [reportLicense, setReportLicense] = useState<LicenseRow | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const states = [...new Set(licenses.map(l => l.state))].sort()
  const funcs = [...new Set(licenses.map(l => l.func))].sort()
  const items = [...new Set(licenses.map(l => l.item).filter(Boolean))].sort()

  const filteredLicenses = licenses.filter(l => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      [l.state, l.cityCounty, l.func, l.item, l.itemName, l.licenseNo, l.status, l.comment].some(v =>
        v.toLowerCase().includes(q)
      )
    const matchesState = !stateFilter || l.state === stateFilter
    const matchesFunc = !funcFilter || l.func === funcFilter
    const matchesItem = !itemFilter || l.item === itemFilter
    const matchesStatus = !statusFilter || l.status === statusFilter
    const matchesRenewal =
      !renewalFilter ||
      (renewalFilter === 'Expired' && l.actionIn === 'Expired') ||
      (renewalFilter === 'Due Soon' && l.actionIn !== 'Expired' && Number(l.actionIn) <= 30) ||
      (renewalFilter === 'Upcoming' && l.actionIn !== 'Expired' && Number(l.actionIn) > 30)
    return matchesSearch && matchesState && matchesFunc && matchesItem && matchesStatus && matchesRenewal
  })

  const reportStates = [...new Set(reportRows.map(r => r.state))].sort()
  const reportFuncs = [...new Set(reportRows.map(r => r.func))].sort()
  const reportTypes = [...new Set(reportRows.map(r => r.type))].sort()
  const reportFilingTypes = [...new Set(reportRows.map(r => r.filingType))].sort()
  const reportFreqs = [...new Set(reportRows.map(r => r.filingFrequency))].sort()
  const reportDues = [...new Set(reportRows.map(r => r.dueDate))].sort()

  const matchReport = (r: ReportRow, q: string) =>
    !q ||
    [r.state, r.func, r.filingFrequency, r.type, r.filingType, r.accountNo, r.dueDate, r.reportingNotes, r.filingNotes].some(v =>
      String(v).toLowerCase().includes(q.toLowerCase())
    )

  const filteredReports = reportRows.filter(r =>
    matchReport(r, reportSearch) &&
    (!reportStateFilter || r.state === reportStateFilter) &&
    (!reportFuncFilter || r.func === reportFuncFilter) &&
    (!reportTypeFilter || r.type === reportTypeFilter) &&
    (!reportFilingTypeFilter || r.filingType === reportFilingTypeFilter) &&
    (!reportFreqFilter || r.filingFrequency === reportFreqFilter) &&
    (!reportDueFilter || r.dueDate === reportDueFilter)
  )

  const filteredPastReports = pastReports.filter(r => matchReport(r, pastSearch))

  const reportFiltersActive = !!(reportStateFilter || reportFuncFilter || reportTypeFilter || reportFilingTypeFilter || reportFreqFilter || reportDueFilter || reportSearch)

  const clearReportFilters = () => {
    setReportSearch('')
    setReportStateFilter('')
    setReportFuncFilter('')
    setReportTypeFilter('')
    setReportFilingTypeFilter('')
    setReportFreqFilter('')
    setReportDueFilter('')
    setReportPage(1)
  }

  const removeReport = (id: number) => {
    setReportRows(prev => prev.filter(r => r.id !== id))
    setDeleteReportId(null)
  }

  const toggleReportActive = (id: number) => {
    setReportRows(prev => prev.map(r => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  const saveReport = (data: Omit<ReportRow, 'id'>, addAnother: boolean) => {
    if (editReport) {
      setReportRows(prev => prev.map(r => (r.id === editReport.id ? { ...r, ...data } : r)))
      setEditReport(null)
      setAddReportOpen(false)
      return
    }
    const nextId = Math.max(0, ...reportRows.map(r => r.id)) + 1
    setReportRows(prev => [{ id: nextId, ...data }, ...prev])
    if (!addAnother) setAddReportOpen(false)
  }

  const renderReportRow = (r: ReportRow, i: number, opts: { actions: boolean }) => (
    <tr
      key={r.id}
      className={`border-b border-slate-100 hover:bg-slate-50/80 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'} ${r.active ? '' : 'opacity-60'}`}
    >
      <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{r.state}</td>
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{r.func}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.filingFrequency}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.type}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.filingType}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.accountNo || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.dueDate || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{r.login || '—'}</td>
      <td className="px-4 py-3 whitespace-nowrap"><ReportSecretCell value={r.password} label="password" /></td>
      <td className="px-4 py-3 whitespace-nowrap"><ReportSecretCell value={r.pin} label="PIN" /></td>
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate" title={r.reportingNotes}>{r.reportingNotes || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[160px] truncate" title={r.filingNotes}>{r.filingNotes || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex justify-center">
          {opts.actions ? (
            <button
              type="button"
              onClick={() => toggleReportActive(r.id)}
              role="switch"
              aria-checked={r.active}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${r.active ? 'bg-[#12518c]' : 'bg-slate-300'}`}
              title={r.active ? 'Active' : 'Inactive'}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${r.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          ) : (
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full ${r.active ? 'bg-[#12518c]/50' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ${r.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
          )}
        </div>
      </td>
      {opts.actions && (
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-0.5">
            <button type="button" onClick={() => setViewReport(r)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="View">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                <circle cx="8" cy="8" r="1.75" />
              </svg>
            </button>
            <button type="button" onClick={() => { setEditReport(r); setAddReportOpen(true) }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
              </svg>
            </button>
            <button type="button" onClick={() => setDeleteReportId(r.id)} className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors" title="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </div>
        </td>
      )}
    </tr>
  )

  const activeCount = licenses.filter(l => l.status === 'Active').length
  const expiredCount = licenses.filter(l => l.actionIn === 'Expired').length
  const canceledCount = licenses.filter(l => l.status === 'Canceled').length
  const reportActiveCount = reportRows.filter(r => r.active).length
  const reportInactiveCount = reportRows.filter(r => !r.active).length
  const filtersActive = !!(stateFilter || funcFilter || itemFilter || statusFilter || renewalFilter || search)

  const clearFilters = () => {
    setSearch('')
    setStateFilter('')
    setFuncFilter('')
    setItemFilter('')
    setStatusFilter('')
    setRenewalFilter('')
  }

  const removeLicense = (id: number) => {
    setLicenses(prev => prev.filter(l => l.id !== id))
    setDeleteId(null)
  }

  const addLicense = (data: Omit<LicenseRow, 'id'>, addAnother: boolean) => {
    const nextId = Math.max(0, ...licenses.map(l => l.id)) + 1
    setLicenses(prev => [{ id: nextId, ...data }, ...prev])
    if (!addAnother) setAddOpen(false)
  }

  const updateLicense = (data: Omit<LicenseRow, 'id'>) => {
    if (!editLicense) return
    setLicenses(prev => prev.map(l => (l.id === editLicense.id ? { ...l, ...data } : l)))
    setEditLicense(null)
  }

  const licenseColumns = [
    'State',
    'City/County',
    'Function',
    'Item',
    'Item Name',
    'License / Permit #',
    'Renewal Due',
    'Expiration',
    'Action In',
    'Status',
    'Comment',
    'Actions',
  ] as const

  const reportColumns = [
    'State',
    'Function',
    'Filing Frequency',
    'Type',
    'Filing Type',
    'Account No',
    'Due Date',
    'Login',
    'Password',
    'Pin',
    'Reporting Notes',
    'Filing Notes',
    'Status',
  ] as const

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      {/* Sub-tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-0 px-2 border-b border-slate-100">
          {(['Licensing Summary', 'Reporting Summary'] as const).map(t => {
            const active = subTab === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => setSubTab(t)}
                className={`relative px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-[#12518c]' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t}
                <span
                  className={`absolute left-2 right-2 bottom-0 h-0.5 rounded-full ${
                    active ? 'bg-[#12518c]' : 'bg-transparent'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {subTab === 'Licensing Summary' ? (
          <>
            {/* Header + stats */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#12518c]">Licensing Summary</h2>
                  <p className="text-xs text-slate-500">Company ID {companyId} · permits, bonds, and state licenses</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                  Active <span className="tabular-nums">{activeCount}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-danger-light text-[11px] font-semibold text-[#bb5757]">
                  Expired <span className="tabular-nums">{expiredCount}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
                  Canceled <span className="tabular-nums">{canceledCount}</span>
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6 2.5v7M2.5 6h7" />
                  </svg>
                  Add New
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-slate-100 bg-white">
              <AddressSearchInput value={search} onChange={v => setSearch(v)} />
              <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} className={filterSelectClassName(stateFilter)}>
                <option value="">State / State Code</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={funcFilter} onChange={e => setFuncFilter(e.target.value)} className={filterSelectClassName(funcFilter)}>
                <option value="">Function</option>
                {funcs.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select value={itemFilter} onChange={e => setItemFilter(e.target.value)} className={filterSelectClassName(itemFilter)}>
                <option value="">Item</option>
                {items.map(it => <option key={it} value={it}>{it}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={filterSelectClassName(statusFilter)}>
                <option value="">Item Status</option>
                <option value="Active">Active</option>
                <option value="Canceled">Canceled</option>
              </select>
              <select value={renewalFilter} onChange={e => setRenewalFilter(e.target.value)} className={filterSelectClassName(renewalFilter)}>
                <option value="">Renewal Timing</option>
                <option value="Expired">Expired</option>
                <option value="Due Soon">Due Soon (≤30 days)</option>
                <option value="Upcoming">Upcoming</option>
              </select>
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                >
                  Clear filters
                </button>
              )}
              <button type="button" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Column settings">
                <GridViewIcon />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60">
                    {licenseColumns.map((h, i) => (
                      <th
                        key={h}
                        className={`px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                          i === licenseColumns.length - 1 ? 'text-center' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-sm text-slate-400">No licenses match your filters.</td>
                    </tr>
                  ) : (
                    filteredLicenses.map((l, i) => (
                      <tr
                        key={l.id}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50/80 ${
                          i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                        }`}
                      >
                        <td className="px-3 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{l.state}</td>
                        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{l.cityCounty || '—'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">{l.func}</span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{l.item || '—'}</td>
                        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap max-w-[180px] truncate" title={l.itemName}>{l.itemName || '—'}</td>
                        <td className="px-3 py-3 text-sm text-slate-700 font-medium whitespace-nowrap tabular-nums">{l.licenseNo || '—'}</td>
                        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{l.renewalDue || '—'}</td>
                        <td className="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{l.expiration || '—'}</td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          {l.actionIn === 'Expired' ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#bb5757] text-white">Expired</span>
                          ) : Number(l.actionIn) <= 30 ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e1c16e]/30 text-[#8a6d24]">{l.actionIn}d</span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">{l.actionIn}d</span>
                          )}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            l.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-slate-500 whitespace-nowrap max-w-[140px] truncate" title={l.comment}>{l.comment || '—'}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-0.5">
                            <button type="button" onClick={() => setViewLicense(l)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="View">
                              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                                <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                                <circle cx="8" cy="8" r="1.75" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => setEditLicense(l)} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                                <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => setReportLicense(l)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="Report">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                                <path d="M4 2.5h5.5L13 6v7.5H4V2.5z" />
                                <path d="M9.5 2.5V6H13" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => setDeleteId(l.id)} className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors" title="Delete">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Header + stats */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-[#12518c]">Reporting Summary</h2>
                  <p className="text-xs text-slate-500">Company ID {companyId} · filing schedules, credentials, and due dates</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-[11px] font-semibold text-emerald-700">
                  Active <span className="tabular-nums">{reportActiveCount}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-600">
                  Inactive <span className="tabular-nums">{reportInactiveCount}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-[11px] font-semibold text-sky-700">
                  Total <span className="tabular-nums">{filteredReports.length}</span>
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                >
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => { setEditReport(null); setAddReportOpen(true) }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M6 2.5v7M2.5 6h7" />
                  </svg>
                  Add New
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-end gap-2 px-5 py-3 border-b border-slate-100 bg-white">
              <AddressSearchInput value={reportSearch} onChange={v => { setReportSearch(v); setReportPage(1) }} />
              <select value={reportStateFilter} onChange={e => { setReportStateFilter(e.target.value); setReportPage(1) }} className={filterSelectClassName(reportStateFilter)}>
                <option value="">State</option>
                {reportStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={reportFuncFilter} onChange={e => { setReportFuncFilter(e.target.value); setReportPage(1) }} className={filterSelectClassName(reportFuncFilter)}>
                <option value="">Function</option>
                {reportFuncs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={reportTypeFilter} onChange={e => { setReportTypeFilter(e.target.value); setReportPage(1) }} className={filterSelectClassName(reportTypeFilter)}>
                <option value="">Report Type</option>
                {reportTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={reportFilingTypeFilter} onChange={e => { setReportFilingTypeFilter(e.target.value); setReportPage(1) }} className={filterSelectClassName(reportFilingTypeFilter)}>
                <option value="">Filing Type</option>
                {reportFilingTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={reportFreqFilter} onChange={e => { setReportFreqFilter(e.target.value); setReportPage(1) }} className={filterSelectClassName(reportFreqFilter)}>
                <option value="">Filing Frequency</option>
                {reportFreqs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={reportDueFilter} onChange={e => { setReportDueFilter(e.target.value); setReportPage(1) }} className={filterSelectClassName(reportDueFilter)}>
                <option value="">Due Date</option>
                {reportDues.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {reportFiltersActive && (
                <button
                  type="button"
                  onClick={clearReportFilters}
                  className="h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                >
                  Clear filters
                </button>
              )}
              <button type="button" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Column settings">
                <GridViewIcon />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60">
                    {reportColumns.map((h) => (
                      <th
                        key={h}
                        className={`px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                          h === 'Status' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={reportColumns.length + 1} className="px-4 py-12 text-center text-sm text-slate-400">No reports match your filters.</td>
                    </tr>
                  ) : (
                    filteredReports.map((r, i) => renderReportRow(r, i, { actions: true }))
                  )}
                </tbody>
              </table>
            </div>

            <AddressTableFooter total={filteredReports.length} page={reportPage} onPageChange={setReportPage} />

            {/* Past Reports */}
            <div className="border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPastReportsOpen(o => !o)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left bg-gradient-to-r from-slate-50/80 to-white hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <svg
                    width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-slate-400 transition-transform flex-shrink-0 ${pastReportsOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M6 4l4 4-4 4" />
                  </svg>
                  <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-[#12518c]">Past Reports</h2>
                    <p className="text-xs text-slate-500">Archived / inactive filings</p>
                  </div>
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{pastReports.length}</span>
                </div>
              </button>

              {pastReportsOpen && (
                <>
                  <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-y border-slate-100 bg-white">
                    <AddressSearchInput value={pastSearch} onChange={setPastSearch} />
                    <button type="button" className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors ml-auto" title="Column settings">
                      <GridViewIcon />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px]">
                      <thead>
                        <tr className="border-y border-slate-100 bg-slate-50/60">
                          {reportColumns.map((h) => (
                            <th
                              key={h}
                              className={`px-3 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                                h === 'Status' ? 'text-center' : 'text-left'
                              }`}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPastReports.length === 0 ? (
                          <tr>
                            <td colSpan={reportColumns.length} className="px-4 py-12 text-center text-sm text-slate-400">No record found!</td>
                          </tr>
                        ) : (
                          filteredPastReports.map((r, i) => renderReportRow(r, i, { actions: false }))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-5 py-3 text-xs text-slate-500 border-t border-slate-100">
                    Total: <span className="font-semibold text-slate-700">{filteredPastReports.length}</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {(addReportOpen || editReport) && (
        <AddReportModal
          key={editReport ? editReport.id : 'new'}
          initial={editReport}
          states={REPORT_STATE_CODES}
          onClose={() => { setAddReportOpen(false); setEditReport(null) }}
          onSave={saveReport}
        />
      )}

      {reportLicense && (
        <LicenseReportModal
          key={reportLicense.id}
          license={reportLicense}
          companyId={companyId}
          onClose={() => setReportLicense(null)}
          onSave={(data) => {
            const nextId = Math.max(0, ...reportRows.map(r => r.id), ...pastReports.map(r => r.id)) + 1
            setReportRows(prev => [{ id: nextId, ...data }, ...prev])
            setReportLicense(null)
            setSubTab('Reporting Summary')
          }}
        />
      )}

      {viewReport && (
        <AddressModalShell maxWidth="max-w-lg" onClose={() => setViewReport(null)}>
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Report Details</h3>
              <p className="text-[11px] text-slate-500">{viewReport.state} · {viewReport.func}</p>
            </div>
            <button type="button" onClick={() => setViewReport(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-5 grid grid-cols-2 gap-4">
            {[
              ['State', viewReport.state],
              ['Function', viewReport.func],
              ['Filing Frequency', viewReport.filingFrequency],
              ['Type', viewReport.type],
              ['Filing Type', viewReport.filingType],
              ['Account No', viewReport.accountNo || '—'],
              ['Due Date', viewReport.dueDate || '—'],
              ['Login', viewReport.login || '—'],
              ['Password', viewReport.password || '—'],
              ['Pin', viewReport.pin || '—'],
              ['Reporting Notes', viewReport.reportingNotes || '—'],
              ['Filing Notes', viewReport.filingNotes || '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="mt-0.5 text-sm text-slate-700 break-words">{val}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={() => setViewReport(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Close
            </button>
          </div>
        </AddressModalShell>
      )}

      {deleteReportId !== null && (
        <AddressModalShell maxWidth="max-w-sm" onClose={() => setDeleteReportId(null)}>
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-light text-[#bb5757] shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Delete report?</h3>
                <p className="mt-1 text-xs text-slate-500">This reporting record will be permanently removed. This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={() => setDeleteReportId(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => removeReport(deleteReportId)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#bb5757] text-white hover:bg-[#a64a4a] transition-colors">
              Delete
            </button>
          </div>
        </AddressModalShell>
      )}

      {viewLicense && (
        <ViewLicenseModal
          license={viewLicense}
          onClose={() => setViewLicense(null)}
          onEdit={() => {
            setEditLicense(viewLicense)
            setViewLicense(null)
          }}
        />
      )}

      {deleteId != null && (
        <AddressDeleteConfirmModal
          title="Delete license"
          locationName={
            licenses.find(l => l.id === deleteId)
              ? `${licenses.find(l => l.id === deleteId)!.state} ${licenses.find(l => l.id === deleteId)!.item || licenses.find(l => l.id === deleteId)!.func}`
              : 'this license'
          }
          onCancel={() => setDeleteId(null)}
          onConfirm={() => removeLicense(deleteId)}
        />
      )}
      {addOpen && (
        <AddLicenseModal
          companyId={companyId}
          onClose={() => setAddOpen(false)}
          onSave={addLicense}
        />
      )}
      {editLicense && (
        <AddLicenseModal
          companyId={companyId}
          license={editLicense}
          onClose={() => setEditLicense(null)}
          onSave={(data) => updateLicense(data)}
        />
      )}
    </div>
  )
}

function maskCredentialValue(value: string) {
  if (!value || value === '—') return '—'
  return '••••••••'
}

function CredentialSensitiveCell({
  value,
  unlocked,
  mono,
  link,
}: {
  value: string
  unlocked: boolean
  mono?: boolean
  link?: boolean
}) {
  const display = unlocked ? (value || '—') : maskCredentialValue(value)
  const canCopy = unlocked && value && value !== '—'

  const copy = () => {
    if (!canCopy) return
    void navigator.clipboard.writeText(value)
  }

  if (link && unlocked && value) {
    const href = value.startsWith('http') ? value : `https://${value}`
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-[#12518c] hover:underline truncate block max-w-[180px]" title={value}>
        {value}
      </a>
    )
  }

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className={`text-sm truncate max-w-[140px] ${unlocked ? (mono ? 'text-slate-600 font-mono' : 'text-slate-700') : 'text-slate-400 tracking-widest'}`} title={unlocked ? value : undefined}>
        {display}
      </span>
      {canCopy && (
        <button type="button" onClick={copy} className="p-1 rounded text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors flex-shrink-0" title="Copy">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
            <path d="M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5" />
          </svg>
        </button>
      )}
    </div>
  )
}

function UnlockCredentialsModal({
  onClose,
  onUnlock,
}: {
  onClose: () => void
  onUnlock: () => void
}) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleUnlock = () => {
    if (!password.trim()) {
      setError(true)
      return
    }
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      if (password.length < 4) {
        setError(true)
        return
      }
      onUnlock()
    }, 400)
  }

  return (
    <AddressModalShell maxWidth="max-w-sm" onClose={onClose}>
      <div className="px-5 pt-5 pb-2">
        <div className="flex flex-col items-center text-center">
          <span className="w-12 h-12 rounded-2xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Unlock credentials</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[260px]">
            Enter your account password to view sensitive login details for this company.
          </p>
        </div>
        <div className="mt-5">
          <label className="block">
            <span className="text-[11px] font-medium text-slate-500 mb-1.5 block">Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false) }}
                onKeyDown={e => { if (e.key === 'Enter') handleUnlock() }}
                autoFocus
                placeholder="Enter your password"
                className={`w-full h-10 pl-3 pr-10 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                  error ? 'border-[#bb5757] focus:ring-[#bb5757]/20 focus:border-[#bb5757]' : 'border-slate-200 focus:ring-[#12518c]/25 focus:border-[#12518c]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M2 2l12 12M6.5 6.7A3 3 0 0 0 8 11a3 3 0 0 0 2.9-2.2M4.2 4.3C2.7 5.4 1.5 7 1.5 8s2.5 4.5 6.5 4.5c1.1 0 2.1-.3 3-.8M11 5.5A3 3 0 0 1 12.5 8" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                    <circle cx="8" cy="8" r="1.75" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          {error && (
            <p className="mt-2 text-[11px] text-[#bb5757] flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="8" cy="8" r="6" /><path d="M8 5.5v3M8 10.5h.01" />
              </svg>
              Invalid password. Please try again.
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleUnlock}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors disabled:opacity-60"
        >
          {submitting ? (
            <>
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M8 2v3M8 11v3M2 8h3M11 8h3" strokeLinecap="round" />
              </svg>
              Verifying…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="4" y="7" width="8" height="6" rx="1" />
                <path d="M6 7V5a2 2 0 0 1 4 0v2" />
              </svg>
              Unlock
            </>
          )}
        </button>
      </div>
    </AddressModalShell>
  )
}

function CompanyScopePage({ companyId }: { companyId: number }) {
  type ScopeRow = (typeof COMPANY_SCOPE)[number]

  const [scopes, setScopes] = useState<ScopeRow[]>(COMPANY_SCOPE)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [specialistFilter, setSpecialistFilter] = useState('')
  const [page, setPage] = useState(1)
  const [shipCompliant, setShipCompliant] = useState(true)
  const [shipVersion, setShipVersion] = useState('Autofile')
  const [licenseType, setLicenseType] = useState('DTC')
  const [managedBy, setManagedBy] = useState('')
  const [viewScope, setViewScope] = useState<ScopeRow | null>(null)
  const [editScope, setEditScope] = useState<ScopeRow | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = scopes.filter(s => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      [s.department, s.serviceLevel, s.serviceType, s.subServiceType, s.status, s.specialists, s.client].some(v =>
        String(v).toLowerCase().includes(q)
      )
    return (
      matchesSearch &&
      (!deptFilter || s.department === deptFilter) &&
      (!serviceTypeFilter || s.serviceType === serviceTypeFilter) &&
      (!specialistFilter || s.specialists.split(',').map(x => x.trim()).includes(specialistFilter))
    )
  })

  const filtersActive = !!(search || deptFilter || serviceTypeFilter || specialistFilter)

  const clearFilters = () => {
    setSearch('')
    setDeptFilter('')
    setServiceTypeFilter('')
    setSpecialistFilter('')
    setPage(1)
  }

  const removeScope = (id: number) => {
    setScopes(prev => prev.filter(s => s.id !== id))
    setDeleteId(null)
  }

  const saveScope = (data: Omit<ScopeRow, 'id'>, addAnother: boolean, id?: number) => {
    if (id != null) {
      setScopes(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)))
      setEditScope(null)
      setAddOpen(false)
      return
    }
    const nextId = Math.max(0, ...scopes.map(s => s.id)) + 1
    setScopes(prev => [{ id: nextId, ...data }, ...prev])
    if (!addAnother) setAddOpen(false)
  }

  const statusClass = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700'
      case 'Prospect': return 'bg-sky-50 text-sky-700'
      case 'Onboarding': return 'bg-[#e1c16e]/15 text-[#8a6d24]'
      case 'Offboarding': return 'bg-orange-50 text-orange-700'
      case 'Inactive': return 'bg-slate-100 text-slate-600'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#12518c]">Service Scope</h2>
                <p className="text-xs text-slate-500">Company ID {companyId} · departments, services, and specialists</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12518c]/10 text-[10px] font-semibold text-[#12518c]">
                OOS <span className="tabular-nums">{scopes.filter(s => s.department === 'OOS').length}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-[10px] font-semibold text-teal-700">
                OPS <span className="tabular-nums">{scopes.filter(s => s.department === 'OPS').length}</span>
              </span>
              <button
                type="button"
                onClick={() => { setEditScope(null); setAddOpen(true) }}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 2.5v7M2.5 6h7" />
                </svg>
                Add New
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <AddressSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} />
            <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }} className={filterSelectClassName(deptFilter)}>
              <option value="">Department</option>
              {SCOPE_DEPARTMENTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={serviceTypeFilter} onChange={e => { setServiceTypeFilter(e.target.value); setPage(1) }} className={filterSelectClassName(serviceTypeFilter)}>
              <option value="">Service Type</option>
              {SCOPE_SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={specialistFilter} onChange={e => { setSpecialistFilter(e.target.value); setPage(1) }} className={filterSelectClassName(specialistFilter)}>
              <option value="">Specialist</option>
              {SCOPE_SPECIALISTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
                Clear
              </button>
            )}
            <button type="button" className="p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Column settings">
              <GridViewIcon />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {['Department', 'Service Level', 'Service Type', 'Sub-Service Type', 'Status', 'Specialists', 'Client', 'Action'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i === 7 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">No scope records found.</td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/80 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{s.department}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{s.serviceLevel}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{s.serviceType}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{s.subServiceType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {s.specialists.split(',').map(sp => sp.trim()).filter(Boolean).map(sp => (
                          <span key={sp} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600" title={sp}>
                            {sp}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{s.client || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" onClick={() => setViewScope(s)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="View">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                            <circle cx="8" cy="8" r="1.75" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => { setEditScope(s); setAddOpen(true) }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors" title="Delete">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>

      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
          <h2 className="text-sm font-semibold text-[#12518c]">ShipCompliant</h2>
        </div>
        <div className="px-5 py-5 space-y-5">
          <OwnershipRadioGroup
            label="ShipCompliant"
            value={shipCompliant ? 'Yes' : 'No'}
            onChange={v => setShipCompliant(v === 'Yes')}
            options={[
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ]}
          />
          {shipCompliant && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <OwnershipFormSelect
                label="ShipCompliant Version"
                value={shipVersion}
                onChange={setShipVersion}
                options={SCOPE_SHIP_VERSIONS}
                placeholder="Select…"
              />
              <OwnershipFormSelect
                label="License Type"
                value={licenseType}
                onChange={setLicenseType}
                options={SCOPE_LICENSE_TYPES}
                placeholder="Select…"
              />
              <OwnershipFormSelect
                label="Managed By"
                value={managedBy}
                onChange={setManagedBy}
                options={SCOPE_MANAGED_BY}
                placeholder="Select…"
              />
            </div>
          )}
        </div>
      </section>

      {viewScope && (
        <ViewScopeModal scope={viewScope} onClose={() => setViewScope(null)} />
      )}

      {deleteId !== null && (
        <AddressModalShell maxWidth="max-w-sm" onClose={() => setDeleteId(null)}>
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-light text-[#bb5757] shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Delete scope?</h3>
                <p className="mt-1 text-xs text-slate-500">This scope record will be permanently removed.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => removeScope(deleteId)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#bb5757] text-white hover:bg-[#a64a4a] transition-colors">
              Delete
            </button>
          </div>
        </AddressModalShell>
      )}

      {(addOpen || editScope) && (
        <AddScopeModal
          key={editScope ? editScope.id : 'new'}
          companyId={companyId}
          initial={editScope}
          onClose={() => { setAddOpen(false); setEditScope(null) }}
          onSave={(data, addAnother) => saveScope(data, addAnother, editScope?.id)}
        />
      )}
    </div>
  )
}

function ViewScopeModal({
  scope,
  onClose,
}: {
  scope: (typeof COMPANY_SCOPE)[number]
  onClose: () => void
}) {
  const specialists = scope.specialists
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  return (
    <AddressModalShell maxWidth="max-w-3xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.8-5 7-5 7z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Company — View Scope</h3>
            <p className="text-[11px] text-slate-500">Read-only scope details</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <OwnershipFormSelect label="Department" value={scope.department} onChange={() => {}} options={SCOPE_DEPARTMENTS} readOnly />
          <OwnershipFormSelect label="Service Level" value={scope.serviceLevel} onChange={() => {}} options={SCOPE_SERVICE_LEVELS} readOnly />
          <OwnershipFormSelect label="Service Type" value={scope.serviceType} onChange={() => {}} options={SCOPE_SERVICE_TYPES} readOnly />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OwnershipFormSelect label="Sub-Service Type" value={scope.subServiceType} onChange={() => {}} options={SCOPE_SUB_SERVICE_TYPES} readOnly />
          <OwnershipFormSelect label="Status" value={scope.status} onChange={() => {}} options={SCOPE_STATUSES} readOnly />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OwnershipFormSelect label="Managed By" value={scope.managedBy || '—'} onChange={() => {}} options={scope.managedBy ? SCOPE_MANAGED_BY : ['—']} readOnly />
          <div className="min-w-0">
            <OwnershipFormLabel>Specialist</OwnershipFormLabel>
            <div className={`${detailControlClass} flex flex-wrap items-center gap-1.5 min-h-[38px] bg-slate-50/80 border-slate-200 cursor-default`}>
              {specialists.length === 0 ? (
                <span className="text-sm text-slate-400">—</span>
              ) : (
                specialists.map(code => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    {SCOPE_SPECIALIST_NAMES[code] || code}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AddressModalShell>
  )
}

function AddScopeModal({
  companyId,
  initial,
  onClose,
  onSave,
}: {
  companyId: number
  initial: (typeof COMPANY_SCOPE)[number] | null
  onClose: () => void
  onSave: (data: Omit<(typeof COMPANY_SCOPE)[number], 'id'>, addAnother: boolean) => void
}) {
  const isEdit = !!initial
  const emptyForm = {
    department: '',
    serviceLevel: '',
    serviceType: '',
    subServiceType: '',
    status: 'Active',
    specialists: '',
    managedBy: '',
    client: '',
  }
  const [errors, setErrors] = useState<Partial<Record<'department' | 'serviceType' | 'status', boolean>>>({})
  const [form, setForm] = useState({
    department: initial?.department ?? '',
    serviceLevel: initial?.serviceLevel ?? '',
    serviceType: initial?.serviceType ?? '',
    subServiceType: initial?.subServiceType ?? '',
    status: initial?.status ?? 'Active',
    specialists: initial?.specialists ?? '',
    managedBy: initial?.managedBy ?? '',
    client: initial?.client ?? '',
  })

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key in { department: 1, serviceType: 1, status: 1 }) {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const validate = () => {
    const next = {
      department: !form.department.trim(),
      serviceType: !form.serviceType.trim(),
      status: !form.status.trim(),
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const handleSave = (addAnother: boolean) => {
    if (!validate()) return
    onSave({ ...form }, addAnother)
    if (addAnother && !isEdit) {
      setForm(emptyForm)
      setErrors({})
    }
  }

  return (
    <AddressModalShell maxWidth="max-w-3xl" onClose={onClose}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.8-5 7-5 7z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{isEdit ? 'Company — Edit Scope' : 'Company — Add Scope'}</h3>
            <p className="text-[11px] text-slate-500">{isEdit ? 'Update scope details' : `Company ID ${companyId}`}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <OwnershipFormSelect
              label="Department"
              required
              value={form.department}
              onChange={v => set('department', v)}
              options={SCOPE_DEPARTMENTS}
              placeholder="Select…"
            />
            {errors.department && <p className="mt-1 text-[11px] text-[#bb5757]">Department is required.</p>}
          </div>
          <div>
            <OwnershipFormSelect
              label="Service Type"
              required
              value={form.serviceType}
              onChange={v => set('serviceType', v)}
              options={SCOPE_SERVICE_TYPES}
              placeholder="Select…"
            />
            {errors.serviceType && <p className="mt-1 text-[11px] text-[#bb5757]">Service Type is required.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OwnershipFormSelect
            label="Sub-Service Type"
            value={form.subServiceType}
            onChange={v => set('subServiceType', v)}
            options={SCOPE_SUB_SERVICE_TYPES}
            placeholder="Select…"
          />
          <div>
            <OwnershipFormSelect
              label="Status"
              required
              value={form.status}
              onChange={v => set('status', v)}
              options={SCOPE_STATUSES}
              placeholder="Select…"
            />
            {errors.status && <p className="mt-1 text-[11px] text-[#bb5757]">Status is required.</p>}
          </div>
        </div>

        <OwnershipFormSelect
          label="Managed By"
          value={form.managedBy}
          onChange={v => set('managedBy', v)}
          options={SCOPE_MANAGED_BY}
          placeholder="Select…"
        />
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#12518c]/30 text-[#12518c] bg-white hover:bg-[#12518c]/5 transition-colors"
          >
            Save And Add New
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
        >
          Save
        </button>
      </div>
    </AddressModalShell>
  )
}

function CompanyChangeLogPage({ companyId }: { companyId: number }) {
  type ChangeLogRow = (typeof COMPANY_CHANGE_LOG)[number] & { restored?: boolean }

  const [entries, setEntries] = useState<ChangeLogRow[]>(COMPANY_CHANGE_LOG)
  const [search, setSearch] = useState('')
  const [tabFilter, setTabFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [requesterFilter, setRequesterFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [viewEntry, setViewEntry] = useState<ChangeLogRow | null>(null)
  const [restoreEntry, setRestoreEntry] = useState<ChangeLogRow | null>(null)
  const [sortDesc, setSortDesc] = useState(true)

  const dateInputClass =
    'h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c]'

  const parseLogDate = (value: string) => {
    const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/)
    if (!match) return null
    const parsed = new Date(`${match[3]}-${match[1]}-${match[2]}`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const filtered = entries
    .filter(e => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        [e.statusDate, e.tab, e.recordName, e.field, e.changeType, e.previousData, e.updatedData, e.notes, e.requestedBy].some(v =>
          String(v).toLowerCase().includes(q)
        )
      const logDate = parseLogDate(e.statusDate)
      const fromDate = dateFrom ? new Date(dateFrom) : null
      const toDate = dateTo ? new Date(dateTo) : null
      const matchesFrom = !fromDate || (logDate && logDate >= fromDate)
      const matchesTo = !toDate || (logDate && logDate <= toDate)

      return (
        matchesSearch &&
        (!tabFilter || e.tab === tabFilter) &&
        (!typeFilter || e.changeType === typeFilter) &&
        (!requesterFilter || e.requestedBy === requesterFilter) &&
        matchesFrom &&
        matchesTo
      )
    })
    .sort((a, b) => {
      const da = parseLogDate(a.statusDate)?.getTime() ?? 0
      const db = parseLogDate(b.statusDate)?.getTime() ?? 0
      return sortDesc ? db - da : da - db
    })

  const filtersActive = !!(search || tabFilter || typeFilter || requesterFilter || dateFrom || dateTo)

  const clearFilters = () => {
    setSearch('')
    setTabFilter('')
    setTypeFilter('')
    setRequesterFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const changeTypeClass = (type: string) => {
    switch (type) {
      case 'Add': return 'bg-emerald-50 text-emerald-700'
      case 'Update': return 'bg-sky-50 text-sky-700'
      case 'Delete': return 'bg-danger-light text-[#bb5757]'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const confirmRestore = () => {
    if (!restoreEntry) return
    setEntries(prev =>
      prev.map(e =>
        e.id === restoreEntry.id
          ? {
              ...e,
              restored: true,
              notes: e.notes ? `${e.notes} · Restored` : 'Restored',
              updatedData: e.previousData || e.updatedData,
            }
          : e
      )
    )
    setRestoreEntry(null)
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#12518c]">Change Log</h2>
                <p className="text-xs text-slate-500">Company ID {companyId} · audit trail of record changes</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <AddressSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} />
              <select value={tabFilter} onChange={e => { setTabFilter(e.target.value); setPage(1) }} className={filterSelectClassName(tabFilter)}>
                <option value="">Tab</option>
                {CHANGE_LOG_TABS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className={filterSelectClassName(typeFilter)}>
                <option value="">Change Type</option>
                {CHANGE_LOG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={requesterFilter} onChange={e => { setRequesterFilter(e.target.value); setPage(1) }} className={filterSelectClassName(requesterFilter)}>
                <option value="">Requested By</option>
                {CHANGE_LOG_REQUESTERS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                From
                <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className={dateInputClass} />
              </label>
              <label className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                To
                <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className={dateInputClass} />
              </label>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                  Clear
                </button>
              )}
              <button type="button" className="p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Column settings">
                <GridViewIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => setSortDesc(v => !v)}
                    className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors"
                  >
                    Status Date
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={sortDesc ? '' : 'rotate-180'}>
                      <path d="M2.5 4L5 6.5 7.5 4" />
                    </svg>
                  </button>
                </th>
                {['Tab', 'Record Name', 'Field', 'Change Type', 'Previous Data', 'Updated Data', 'Notes', 'Requested By', 'Action'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i === 8 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-sm text-slate-400">No change log entries found.</td>
                </tr>
              ) : (
                filtered.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/80 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap tabular-nums">{e.statusDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{e.tab}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap max-w-[180px] truncate" title={e.recordName}>{e.recordName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px]">
                      <span className="line-clamp-2" title={e.field}>{e.field}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${changeTypeClass(e.changeType)}`}>
                        {e.changeType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[220px]">
                      <span className="line-clamp-2" title={e.previousData || undefined}>{e.previousData || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 max-w-[220px]">
                      <span className="line-clamp-2" title={e.updatedData || undefined}>{e.updatedData || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 max-w-[140px]">
                      <span className="line-clamp-2" title={e.notes || undefined}>{e.notes || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600" title={e.requestedBy}>
                        {e.requestedBy}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {e.changeType === 'Delete' && !e.restored && (
                          <button
                            type="button"
                            onClick={() => setRestoreEntry(e)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Restore deleted item"
                          >
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9" />
                              <path d="M13.5 8a5.5 5.5 0 0 1-9.4 3.9" />
                              <path d="M11.5 2.5v2.5H14" />
                              <path d="M4.5 13.5v-2.5H2" />
                            </svg>
                          </button>
                        )}
                        {e.changeType === 'Delete' && e.restored && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700" title="Item restored">
                            Restored
                          </span>
                        )}
                        {e.changeType !== 'Delete' && (
                          <button
                            type="button"
                            onClick={() => setViewEntry(e)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                            title="View change details"
                          >
                            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                              <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                              <circle cx="8" cy="8" r="1.75" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>

      {viewEntry && (
        <ViewChangeLogModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}

      {restoreEntry && (
        <RestoreChangeLogModal
          entry={restoreEntry}
          onClose={() => setRestoreEntry(null)}
          onConfirm={confirmRestore}
        />
      )}
    </div>
  )
}

function RestoreChangeLogModal({
  entry,
  onClose,
  onConfirm,
}: {
  entry: (typeof COMPANY_CHANGE_LOG)[number]
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <AddressModalShell maxWidth="max-w-md" onClose={onClose}>
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="flex items-start gap-3 min-w-0 pr-2">
          <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9" />
              <path d="M13.5 8a5.5 5.5 0 0 1-9.4 3.9" />
              <path d="M11.5 2.5v2.5H14" />
              <path d="M4.5 13.5v-2.5H2" />
            </svg>
          </span>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-semibold text-slate-900">Restore deleted item?</h3>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Are you sure you want to restore <span className="font-semibold text-slate-700">{entry.recordName}</span> from {entry.tab}?
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 pb-5">
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600">
          <p className="font-medium text-slate-700 mb-1">Previous data</p>
          <p className="leading-relaxed">{entry.previousData || '—'}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={onConfirm}
          className="min-w-[88px] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide text-white bg-slate-700 hover:bg-slate-800 transition-colors"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={onClose}
          className="min-w-[88px] px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </AddressModalShell>
  )
}

function ViewChangeLogModal({
  entry,
  onClose,
}: {
  entry: (typeof COMPANY_CHANGE_LOG)[number]
  onClose: () => void
}) {
  const changeTypeClass = (type: string) => {
    switch (type) {
      case 'Add': return 'bg-emerald-50 text-emerald-700'
      case 'Update': return 'bg-sky-50 text-sky-700'
      case 'Delete': return 'bg-danger-light text-[#bb5757]'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 8a5.5 5.5 0 0 1 9.4-3.9" />
              <path d="M13.5 8a5.5 5.5 0 0 1-9.4 3.9" />
              <path d="M11.5 2.5v2.5H14" />
              <path d="M4.5 13.5v-2.5H2" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Company — View Change</h3>
            <p className="text-[11px] text-slate-500">{entry.tab} · {entry.recordName}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${changeTypeClass(entry.changeType)}`}>
            {entry.changeType}
          </span>
          <span className="text-xs text-slate-500 tabular-nums">{entry.statusDate}</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            by
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
              {entry.requestedBy}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OwnershipFormField label="Tab" value={entry.tab} onChange={() => {}} readOnly />
          <OwnershipFormField label="Record Name" value={entry.recordName} onChange={() => {}} readOnly />
        </div>

        <OwnershipFormField label="Field" value={entry.field} onChange={() => {}} readOnly />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <OwnershipFormLabel>Previous Data</OwnershipFormLabel>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-600 min-h-[72px] whitespace-pre-wrap">
              {entry.previousData || '—'}
            </div>
          </div>
          <div className="min-w-0">
            <OwnershipFormLabel>Updated Data</OwnershipFormLabel>
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-700 min-h-[72px] whitespace-pre-wrap">
              {entry.updatedData || '—'}
            </div>
          </div>
        </div>

        <OwnershipFormField label="Notes" value={entry.notes || '—'} onChange={() => {}} readOnly />
      </div>
    </AddressModalShell>
  )
}

function CompanyWorkStopPage({ companyId }: { companyId: number }) {
  type WorkStopRow = (typeof COMPANY_WORK_STOP)[number]

  const [rows, setRows] = useState<WorkStopRow[]>(COMPANY_WORK_STOP)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = rows.filter(r => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      [r.status, r.effectiveDate, r.endDate, String(r.dayCount)].some(v =>
        String(v).toLowerCase().includes(q)
      )
    return matchesSearch && (!statusFilter || r.status === statusFilter)
  })

  const filtersActive = !!(search || statusFilter)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setPage(1)
  }

  const removeRow = (id: number) => {
    setRows(prev => prev.filter(r => r.id !== id))
    setDeleteId(null)
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#12518c]">Work Stop</h2>
                <p className="text-xs text-slate-500">Company ID {companyId} · pause history and day counts</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <AddressSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={filterSelectClassName(statusFilter)}>
                <option value="">Status</option>
                {WORK_STOP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                  Clear
                </button>
              )}
              <button type="button" className="p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Column settings">
                <GridViewIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {['Status', 'Effective Date', 'End Date', 'Day Count', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i === 4 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">No work stop records found.</td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/80 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'Work Stop' ? 'bg-danger-light text-[#bb5757]' : 'bg-[#e1c16e]/15 text-[#8a6d24]'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap tabular-nums">{r.effectiveDate}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap tabular-nums">{r.endDate || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 tabular-nums">{r.dayCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors"
                          title="Delete"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>

      {deleteId !== null && (
        <AddressModalShell maxWidth="max-w-sm" onClose={() => setDeleteId(null)}>
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-light text-[#bb5757] shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Delete work stop record?</h3>
                <p className="mt-1 text-xs text-slate-500">This work stop entry will be permanently removed.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => removeRow(deleteId)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#bb5757] text-white hover:bg-[#a64a4a] transition-colors">
              Delete
            </button>
          </div>
        </AddressModalShell>
      )}
    </div>
  )
}

function CompanyAccountActivityPage({ companyId, companyName }: { companyId: number; companyName: string }) {
  type ActivityRow = (typeof COMPANY_ACCOUNT_ACTIVITY)[number]

  const [activities, setActivities] = useState<ActivityRow[]>(COMPANY_ACCOUNT_ACTIVITY)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [flagFilter, setFlagFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [viewActivity, setViewActivity] = useState<ActivityRow | null>(null)
  const [previewActivity, setPreviewActivity] = useState<ActivityRow | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<ActivityRow | null>(null)

  const parseActivityDate = (value: string) => {
    const parsed = new Date(value.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'))
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const filtered = activities.filter(a => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      [a.subject, a.type, a.status, a.flag, a.category, a.backgroundDetails, ...a.authors].some(v =>
        String(v).toLowerCase().includes(q)
      )
    const activityDate = parseActivityDate(a.date)
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo) : null
    const matchesFrom = !fromDate || (activityDate && activityDate >= fromDate)
    const matchesTo = !toDate || (activityDate && activityDate <= toDate)

    return (
      matchesSearch &&
      (!typeFilter || a.type === typeFilter) &&
      (!statusFilter || a.status === statusFilter) &&
      (!flagFilter || a.flag === flagFilter) &&
      (!categoryFilter || a.category === categoryFilter) &&
      (!authorFilter || a.authors.includes(authorFilter)) &&
      matchesFrom &&
      matchesTo
    )
  })

  const filtersActive = !!(search || typeFilter || statusFilter || flagFilter || categoryFilter || authorFilter || dateFrom || dateTo)

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setStatusFilter('')
    setFlagFilter('')
    setCategoryFilter('')
    setAuthorFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  const toggleFollow = (id: number) => {
    setActivities(prev => prev.map(a => (a.id === id ? { ...a, following: !a.following } : a)))
  }

  const removeActivity = (id: number) => {
    setActivities(prev => prev.filter(a => a.id !== id))
    setDeleteId(null)
  }

  const saveActivity = (data: Omit<ActivityRow, 'id'>, id?: number) => {
    if (id != null) {
      setActivities(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)))
      setEditActivity(null)
      setAddOpen(false)
      return
    }
    const nextId = Math.max(0, ...activities.map(a => a.id)) + 1
    setActivities(prev => [{ id: nextId, ...data }, ...prev])
    setAddOpen(false)
  }

  const flagClass = (flag: string) => {
    switch (flag) {
      case 'Green': return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
      case 'Yellow': return 'bg-[#e1c16e]/15 text-[#8a6d24] ring-[#e1c16e]/60'
      case 'Red': return 'bg-danger-light text-[#bb5757] ring-danger-border/60'
      case 'Blue': return 'bg-sky-50 text-sky-700 ring-sky-200/60'
      default: return 'bg-slate-100 text-slate-600 ring-slate-200/60'
    }
  }

  const statusClass = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-[#12518c]/10 text-[#12518c]'
      case 'In Progress': return 'bg-sky-50 text-sky-700'
      case 'Pending': return 'bg-[#e1c16e]/15 text-[#8a6d24]'
      case 'Closed': return 'bg-slate-100 text-slate-600'
      default: return 'bg-slate-100 text-slate-600'
    }
  }

  const openCount = activities.filter(a => a.status === 'Open').length
  const followingCount = activities.filter(a => a.following).length

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#12518c]">Account Activity</h2>
                <p className="text-xs text-slate-500">Company ID {companyId} · issues, notes, and follow-ups</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12518c]/10 text-[10px] font-semibold text-[#12518c]">
                Open <span className="tabular-nums">{openCount}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-600">
                Following <span className="tabular-nums">{followingCount}</span>
              </span>
              <button
                type="button"
                onClick={() => { setEditActivity(null); setAddOpen(true) }}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 2.5v7M2.5 6h7" />
                </svg>
                Add New
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <AddressSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} />
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className={filterSelectClassName(typeFilter)}>
              <option value="">Type</option>
              {ACTIVITY_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className={filterSelectClassName(statusFilter)}>
              <option value="">Status</option>
              {ACTIVITY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={flagFilter} onChange={e => { setFlagFilter(e.target.value); setPage(1) }} className={filterSelectClassName(flagFilter)}>
              <option value="">Flag</option>
              {ACTIVITY_FLAGS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className={filterSelectClassName(categoryFilter)}>
              <option value="">Category</option>
              {ACTIVITY_CATEGORIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={authorFilter} onChange={e => { setAuthorFilter(e.target.value); setPage(1) }} className={filterSelectClassName(authorFilter)}>
              <option value="">Author</option>
              {ACTIVITY_AUTHORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className={filterSelectClassName(dateFrom, 'min-w-[130px]')}
              title="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className={filterSelectClassName(dateTo, 'min-w-[130px]')}
              title="To date"
            />
            {filtersActive && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
                Clear
              </button>
            )}
            <button type="button" className="p-2 h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors" title="Column settings">
              <GridViewIcon />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {['Subject', 'Date', 'Type', 'Status', 'Flag', 'Category', 'Authors', 'Follow Up', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i >= 6 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-slate-400">No activity found.</td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-slate-100 hover:bg-slate-50/80 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium max-w-[220px]">
                      <button
                        type="button"
                        onClick={() => setPreviewActivity(a)}
                        className="text-left text-[#12518c] hover:underline truncate max-w-full"
                        title={a.subject}
                      >
                        {a.subject}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.date}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusClass(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${flagClass(a.flag)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          a.flag === 'Green' ? 'bg-emerald-500' :
                          a.flag === 'Yellow' ? 'bg-[#e1c16e]' :
                          a.flag === 'Red' ? 'bg-[#bb5757]' : 'bg-sky-500'
                        }`} />
                        {a.flag}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {a.authors.map(author => (
                          <span key={author} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600" title={author}>
                            {author}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => toggleFollow(a.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                            a.following
                              ? 'bg-[#12518c]/10 text-[#12518c] border border-[#12518c]/20'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-[#12518c]/30 hover:text-[#12518c]'
                          }`}
                        >
                          <svg width="11" height="11" viewBox="0 0 16 16" fill={a.following ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
                            <path d="M8 2.5l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
                          </svg>
                          {a.following ? 'Following' : 'Follow'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        <button type="button" onClick={() => setViewActivity(a)} className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors" title="View">
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                            <circle cx="8" cy="8" r="1.75" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => { setEditActivity(a); setAddOpen(true) }} className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors" title="Edit">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeleteId(a.id)} className="p-1 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors" title="Delete">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>

      {viewActivity && (
        <AddressModalShell maxWidth="max-w-3xl" onClose={() => setViewActivity(null)}>
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.8-5 7-5 7z" />
                </svg>
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">Company — View Note</h3>
                <p className="text-[11px] text-slate-500">Read-only activity details</p>
              </div>
            </div>
            <button type="button" onClick={() => setViewActivity(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          </div>
          <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OwnershipFormSelect label="Type" required value={viewActivity.type} onChange={() => {}} options={ACTIVITY_TYPES} readOnly />
              <OwnershipFormSelect label="Status" value={viewActivity.status} onChange={() => {}} options={ACTIVITY_STATUSES} readOnly />
              <OwnershipFormSelect label="Flag" value={viewActivity.flag} onChange={() => {}} options={ACTIVITY_FLAGS} readOnly />
              <OwnershipFormSelect label="Category" value={viewActivity.category} onChange={() => {}} options={ACTIVITY_CATEGORIES} readOnly />
            </div>

            <OwnershipFormSelect
              label="Department"
              value={viewActivity.department || '—'}
              onChange={() => {}}
              options={viewActivity.department ? ACTIVITY_DEPARTMENTS : ['—']}
              readOnly
            />

            <OwnershipFormField
              label="Subject"
              value={viewActivity.subject}
              onChange={() => {}}
              readOnly
            />

            <div>
              <OwnershipFormLabel required>Background and Details</OwnershipFormLabel>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {viewActivity.authors[0] || 'AD'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">Alissa DeLaRiva</p>
                      <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{viewActivity.backgroundDetails}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-500 whitespace-nowrap pt-1">
                    {viewActivity.date.split(' ').slice(0, 1).join(' ')}
                    <br />
                    {viewActivity.date.split(' ').slice(1).join(' ')}
                  </div>
                </div>
                <div className="mx-4 mb-3 border-t border-slate-100" />
              </div>
            </div>
          </div>
        </AddressModalShell>
      )}

      {previewActivity && (
        <BackgroundDetailsModal
          companyName={companyName}
          activity={previewActivity}
          onClose={() => setPreviewActivity(null)}
          onStatusChange={(status) => {
            setActivities(prev => prev.map(a => (a.id === previewActivity.id ? { ...a, status } : a)))
            setPreviewActivity(prev => (prev ? { ...prev, status } : prev))
          }}
          onCommentsChange={(comments) => {
            setActivities(prev => prev.map(a => (
              a.id === previewActivity.id
                ? { ...a, comments, backgroundDetails: comments.find(c => c.parentId == null)?.text || a.backgroundDetails }
                : a
            )))
            setPreviewActivity(prev => (prev ? { ...prev, comments } : prev))
          }}
        />
      )}

      {deleteId !== null && (
        <AddressModalShell maxWidth="max-w-sm" onClose={() => setDeleteId(null)}>
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-light text-[#bb5757] shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Delete activity?</h3>
                <p className="mt-1 text-xs text-slate-500">This activity record will be permanently removed.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => removeActivity(deleteId)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#bb5757] text-white hover:bg-[#a64a4a] transition-colors">
              Delete
            </button>
          </div>
        </AddressModalShell>
      )}

      {(addOpen || editActivity) && (
        <AddAccountActivityModal
          key={editActivity ? editActivity.id : 'new'}
          initial={editActivity}
          onClose={() => { setAddOpen(false); setEditActivity(null) }}
          onSave={(data) => saveActivity(data, editActivity?.id)}
        />
      )}
    </div>
  )
}

const ACTIVITY_AUTHOR_NAMES: Record<string, string> = {
  AD: 'Alissa DeLaRiva',
  GL: 'Gina Lopez',
  WL: 'William Lee',
  CC: 'Compliance Cabinet',
}

function BackgroundDetailsModal({
  companyName,
  activity,
  onClose,
  onStatusChange,
  onCommentsChange,
}: {
  companyName: string
  activity: (typeof COMPANY_ACCOUNT_ACTIVITY)[number]
  onClose: () => void
  onStatusChange: (status: string) => void
  onCommentsChange: (comments: ActivityComment[]) => void
}) {
  const seedComments = (row: typeof activity): ActivityComment[] =>
    row.comments?.length
      ? row.comments
      : row.backgroundDetails.trim()
        ? [{ id: 1, author: row.authors[0] || 'AD', text: row.backgroundDetails.trim(), date: row.date, parentId: null }]
        : []

  const [comments, setComments] = useState<ActivityComment[]>(() => seedComments(activity))
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    setComments(seedComments(activity))
  }, [activity.id, activity.comments, activity.backgroundDetails])

  const isOpen = activity.status !== 'Closed'
  const nowLabel = () =>
    new Date().toLocaleString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    })

  const syncComments = (next: ActivityComment[]) => {
    setComments(next)
    onCommentsChange(next)
  }

  const nextCommentId = () => Math.max(0, ...comments.map(c => c.id)) + 1

  const handlePost = () => {
    const text = newComment.trim()
    if (!text) return
    syncComments([
      ...comments,
      { id: nextCommentId(), author: 'AD', text, date: nowLabel(), parentId: null },
    ])
    setNewComment('')
  }

  const handleReply = (parentId: number) => {
    const text = replyText.trim()
    if (!text) return
    syncComments([
      ...comments,
      { id: nextCommentId(), author: 'AD', text, date: nowLabel(), parentId },
    ])
    setReplyText('')
    setReplyingTo(null)
  }

  const startEdit = (comment: ActivityComment) => {
    setEditingId(comment.id)
    setEditText(comment.text)
    setReplyingTo(null)
  }

  const saveEdit = () => {
    if (editingId == null) return
    const text = editText.trim()
    if (!text) return
    syncComments(comments.map(c => (c.id === editingId ? { ...c, text } : c)))
    setEditingId(null)
    setEditText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const rootComments = comments.filter(c => c.parentId == null)
  const repliesFor = (parentId: number) => comments.filter(c => c.parentId === parentId)

  const flagClass = (flag: string) => {
    switch (flag) {
      case 'Green': return 'bg-emerald-50 text-emerald-700 ring-emerald-200/60'
      case 'Yellow': return 'bg-[#e1c16e]/15 text-[#8a6d24] ring-[#e1c16e]/60'
      case 'Red': return 'bg-danger-light text-[#bb5757] ring-danger-border/60'
      case 'Blue': return 'bg-sky-50 text-sky-700 ring-sky-200/60'
      default: return 'bg-slate-100 text-slate-600 ring-slate-200/60'
    }
  }

  const renderComment = (comment: ActivityComment, isReply = false) => {
    const authorName = ACTIVITY_AUTHOR_NAMES[comment.author] || comment.author
    const isEditing = editingId === comment.id

    return (
      <div key={comment.id} className={isReply ? 'ml-10 mt-2' : ''}>
        <div className={`rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 ${isReply ? 'bg-white' : ''}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                {comment.author}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-sm font-semibold text-slate-800">{authorName}</p>
                  <p className="text-[11px] text-slate-400">{comment.date}</p>
                </div>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-y"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={!editText.trim()}
                        className="h-8 px-3 rounded-lg text-[11px] font-semibold text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="h-8 px-3 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                )}
                {!isEditing && (
                  <div className="mt-2 flex items-center gap-3">
                    {!isReply && (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(replyingTo === comment.id ? null : comment.id)
                          setReplyText('')
                          setEditingId(null)
                        }}
                        className="text-[11px] font-semibold text-[#12518c] hover:underline"
                      >
                        Reply
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(comment)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-3 ml-11 flex items-start gap-2">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                rows={2}
                placeholder={`Reply to ${authorName}…`}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleReply(comment.id)
                  }
                }}
              />
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyText.trim()}
                  className="h-8 px-3 rounded-lg text-[11px] font-semibold text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-50"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => { setReplyingTo(null); setReplyText('') }}
                  className="h-8 px-3 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {repliesFor(comment.id).map(reply => renderComment(reply, true))}
      </div>
    )
  }

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            Activity Details — {companyName}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{activity.subject}</p>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-medium text-slate-500">Status</p>
            <button
              type="button"
              role="switch"
              aria-checked={isOpen}
              onClick={() => onStatusChange(isOpen ? 'Closed' : 'Open')}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${isOpen ? 'bg-[#12518c]' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isOpen ? 'translate-x-5' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${isOpen ? 'text-[#12518c]' : 'text-slate-500'}`}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">{activity.date}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Type</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{activity.type}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Flag</p>
            <span className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ring-inset ${flagClass(activity.flag)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                activity.flag === 'Green' ? 'bg-emerald-500' :
                activity.flag === 'Yellow' ? 'bg-[#e1c16e]' :
                activity.flag === 'Red' ? 'bg-[#bb5757]' : 'bg-sky-500'
              }`} />
              {activity.flag}
            </span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Category</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{activity.category}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Department</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{activity.department || '—'}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Comments</h4>
            <span className="text-[11px] text-slate-400 tabular-nums">{comments.length}</span>
          </div>
          <div className="space-y-3">
            {rootComments.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No comments yet. Be the first to post.</p>
            ) : (
              rootComments.map(comment => renderComment(comment))
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/40">
        <div className="flex items-end gap-2">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={2}
            placeholder="Post a new comment…"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handlePost()
              }
            }}
          />
          <button
            type="button"
            onClick={handlePost}
            disabled={!newComment.trim()}
            className="h-9 px-4 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-center"
          >
            Post
          </button>
        </div>
      </div>
    </AddressModalShell>
  )
}

function AddAccountActivityModal({
  initial,
  onClose,
  onSave,
}: {
  initial: (typeof COMPANY_ACCOUNT_ACTIVITY)[number] | null
  onClose: () => void
  onSave: (data: Omit<(typeof COMPANY_ACCOUNT_ACTIVITY)[number], 'id'>) => void
}) {
  const isEdit = !!initial
  const [errors, setErrors] = useState<Partial<Record<'type' | 'backgroundDetails', boolean>>>({})
  const [form, setForm] = useState({
    type: initial?.type ?? '',
    status: initial?.status ?? '',
    flag: initial?.flag ?? '',
    category: initial?.category ?? '',
    department: initial?.department ?? '',
    subject: initial?.subject ?? '',
    backgroundDetails: initial?.backgroundDetails ?? '',
  })

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'type' || key === 'backgroundDetails') {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const validate = () => {
    const next = {
      type: !form.type.trim(),
      backgroundDetails: !form.backgroundDetails.trim(),
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const handleSave = () => {
    if (!validate()) return
    const now = new Date()
    const date = initial?.date ?? now.toLocaleString('en-US', {
      month: '2-digit', day: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
    })
    const details = form.backgroundDetails.trim()
    const authors = initial?.authors ?? ['AD']
    const comments = initial?.comments?.length
      ? initial.comments
      : [{ id: 1, author: authors[0] || 'AD', text: details, date, parentId: null as number | null }]
    onSave({
      date,
      subject: form.subject.trim() || form.type || 'Untitled note',
      type: form.type,
      status: form.status || 'Open',
      flag: form.flag || 'Green',
      category: form.category || '—',
      department: form.department,
      backgroundDetails: details,
      authors,
      following: initial?.following ?? false,
      comments,
    })
  }

  return (
    <AddressModalShell maxWidth="max-w-xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 14s-5-3.2-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 7c0 3.8-5 7-5 7z" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{isEdit ? 'Company — Edit Note' : 'Company — Add Note'}</h3>
            <p className="text-[11px] text-slate-500">Capture an issue, note, or follow-up for this company</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <OwnershipFormSelect
              label="Type"
              required
              value={form.type}
              onChange={v => set('type', v)}
              options={ACTIVITY_TYPES}
              placeholder="Select…"
            />
            {errors.type && <p className="mt-1 text-[11px] text-[#bb5757]">Type is required.</p>}
          </div>
          <OwnershipFormSelect
            label="Status"
            value={form.status}
            onChange={v => set('status', v)}
            options={ACTIVITY_STATUSES}
            placeholder="Select…"
          />
          <OwnershipFormSelect
            label="Flag"
            value={form.flag}
            onChange={v => set('flag', v)}
            options={ACTIVITY_FLAGS}
            placeholder="Select Flag"
          />
          <OwnershipFormSelect
            label="Category"
            value={form.category}
            onChange={v => set('category', v)}
            options={ACTIVITY_CATEGORIES}
            placeholder="Select Category"
          />
        </div>

        <OwnershipFormSelect
          label="Department"
          value={form.department}
          onChange={v => set('department', v)}
          options={ACTIVITY_DEPARTMENTS}
          placeholder="Select…"
        />

        <OwnershipFormField
          label="Subject"
          value={form.subject}
          onChange={v => set('subject', v)}
          placeholder="Enter subject"
        />

        <div>
          <OwnershipFormLabel required>Background and Details</OwnershipFormLabel>
          <textarea
            value={form.backgroundDetails}
            onChange={e => set('backgroundDetails', e.target.value)}
            rows={5}
            placeholder="Add a comment…"
            className={`w-full px-3 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 resize-y min-h-[120px] ${
              errors.backgroundDetails
                ? 'border-[#bb5757] focus:ring-[#bb5757]/20 focus:border-[#bb5757]'
                : 'border-slate-200 focus:ring-[#12518c]/25 focus:border-[#12518c]'
            }`}
          />
          {errors.backgroundDetails && <p className="mt-1 text-[11px] text-[#bb5757]">Background and Details is required.</p>}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
        >
          Save
        </button>
      </div>
    </AddressModalShell>
  )
}

function CompanyCredentialsPage({ companyId }: { companyId: number }) {
  type CredentialRow = (typeof COMPANY_CREDENTIALS)[number]

  const [credentials, setCredentials] = useState<CredentialRow[]>(COMPANY_CREDENTIALS)
  const [pastCredentials] = useState<CredentialRow[]>(PAST_CREDENTIALS)
  const [unlocked, setUnlocked] = useState(false)
  const [unlockOpen, setUnlockOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesEditing, setNotesEditing] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [funcFilter, setFuncFilter] = useState('')
  const [filingTypeFilter, setFilingTypeFilter] = useState('')
  const [loginTypeFilter, setLoginTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pastSearch, setPastSearch] = useState('')
  const [pastOpen, setPastOpen] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const states = [...new Set(credentials.map(c => c.state))].sort()
  const funcs = [...new Set(credentials.map(c => c.func))].sort()
  const filingTypes = [...new Set(credentials.map(c => c.filingType))].sort()
  const loginTypes = [...new Set(credentials.map(c => c.loginType))].sort()

  const matchCredential = (c: CredentialRow, q: string) =>
    !q ||
    [c.state, c.func, c.loginType, c.companyName, c.filingType, c.userName, c.managedBy, c.reportingNotes, c.licensingNotes].some(v =>
      String(v).toLowerCase().includes(q.toLowerCase())
    )

  const filtered = credentials.filter(c =>
    matchCredential(c, search) &&
    (!stateFilter || c.state === stateFilter) &&
    (!funcFilter || c.func === funcFilter) &&
    (!filingTypeFilter || c.filingType === filingTypeFilter) &&
    (!loginTypeFilter || c.loginType === loginTypeFilter)
  )

  const filteredPast = pastCredentials.filter(c => matchCredential(c, pastSearch))

  const filtersActive = !!(search || stateFilter || funcFilter || filingTypeFilter || loginTypeFilter)

  const clearFilters = () => {
    setSearch('')
    setStateFilter('')
    setFuncFilter('')
    setFilingTypeFilter('')
    setLoginTypeFilter('')
    setPage(1)
  }

  const toggleActive = (id: number) => {
    setCredentials(prev => prev.map(c => (c.id === id ? { ...c, active: !c.active } : c)))
  }

  const removeCredential = (id: number) => {
    setCredentials(prev => prev.filter(c => c.id !== id))
    setDeleteId(null)
  }

  const saveNotes = () => {
    setNotes(notesDraft)
    setNotesEditing(false)
  }

  const credentialColumns = [
    'State',
    'Function',
    'Login Type',
    'Company Name',
    'Filing Type',
    'User Name',
    'Password',
    'PIN',
    'Website',
    'Secret Question',
    'Managed By',
    'Reporting Notes',
    'Licensing Notes',
    'Active/Inactive',
  ] as const

  const renderRow = (c: CredentialRow, i: number, opts: { actions: boolean }) => (
    <tr
      key={c.id}
      className={`border-b border-slate-100 hover:bg-slate-50/80 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'} ${c.active ? '' : 'opacity-60'}`}
    >
      <td className="px-4 py-3 text-sm font-semibold text-slate-800 whitespace-nowrap">{c.state}</td>
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{c.func}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.loginType}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap max-w-[140px] truncate" title={c.companyName}>{c.companyName}</td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.filingType}</td>
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap font-mono">{c.userName || '—'}</td>
      <td className="px-4 py-3"><CredentialSensitiveCell value={c.password} unlocked={unlocked} mono /></td>
      <td className="px-4 py-3"><CredentialSensitiveCell value={c.pin} unlocked={unlocked} mono /></td>
      <td className="px-4 py-3"><CredentialSensitiveCell value={c.website} unlocked={unlocked} link /></td>
      <td className="px-4 py-3"><CredentialSensitiveCell value={c.secretQuestion} unlocked={unlocked} /></td>
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{c.managedBy || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[120px] truncate" title={c.reportingNotes}>{c.reportingNotes || '—'}</td>
      <td className="px-4 py-3 text-sm text-slate-600 max-w-[120px] truncate" title={c.licensingNotes}>{c.licensingNotes || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1.5">
          {opts.actions ? (
            <button
              type="button"
              onClick={() => toggleActive(c.id)}
              role="switch"
              aria-checked={c.active}
              disabled={!unlocked}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${c.active ? 'bg-[#12518c]' : 'bg-slate-300'} ${!unlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={unlocked ? (c.active ? 'Active' : 'Inactive') : 'Unlock to edit'}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${c.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          ) : (
            <span className={`relative inline-flex h-5 w-9 items-center rounded-full ${c.active ? 'bg-[#12518c]/50' : 'bg-slate-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ${c.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
          )}
          {opts.actions && (
            <button
              type="button"
              onClick={() => unlocked && setDeleteId(c.id)}
              disabled={!unlocked}
              className={`p-1 rounded-md transition-colors ${unlocked ? 'text-slate-400 hover:text-[#bb5757] hover:bg-danger-light' : 'text-slate-300 cursor-not-allowed'}`}
              title={unlocked ? 'Delete' : 'Unlock to delete'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      {/* Notes */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <path d="M3.5 3.5h9M3.5 6.5h9M3.5 9.5h6" />
            </svg>
            <span className="text-xs font-semibold text-slate-700">Credentials Note</span>
          </div>
          {!notesEditing ? (
            <button
              type="button"
              onClick={() => { setNotesDraft(notes); setNotesEditing(true) }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
              </svg>
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setNotesEditing(false)} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={saveNotes} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#12518c] text-white hover:bg-[#0e4173] transition-colors">
                Save
              </button>
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          {notesEditing ? (
            <textarea
              value={notesDraft}
              onChange={e => setNotesDraft(e.target.value)}
              rows={3}
              placeholder="Add your note here…"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-y"
            />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed">{notes || <span className="text-slate-400 italic">Add your note here…</span>}</p>
          )}
        </div>
      </section>

      {/* Security banner */}
      <div className={`rounded-2xl border px-5 py-4 flex flex-wrap items-center justify-between gap-3 transition-colors ${
        unlocked
          ? 'border-emerald-200 bg-emerald-50/60'
          : 'border-[#e1c16e]/60 bg-[#e1c16e]/10'
      }`}>
        <div className="flex items-start gap-3 min-w-0">
          <span className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            unlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-[#e1c16e]/30 text-[#a1802b]'
          }`}>
            {unlocked ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 7.5-2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${unlocked ? 'text-emerald-800' : 'text-[#5f491a]'}`}>
              {unlocked ? 'Credentials unlocked' : 'Login credentials hidden'}
            </p>
            <p className={`text-xs mt-0.5 leading-relaxed ${unlocked ? 'text-emerald-700/80' : 'text-[#73591e]/80'}`}>
              {unlocked
                ? 'Sensitive fields are visible. Lock when finished to protect this information.'
                : 'Passwords, PINs, and secret answers are masked. Unlock with your account password to view or edit.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => unlocked ? setUnlocked(false) : setUnlockOpen(true)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0 ${
            unlocked
              ? 'border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50'
              : 'text-white bg-[#12518c] hover:bg-[#0e4173] shadow-sm shadow-[#12518c]/20'
          }`}
        >
          {unlocked ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Lock now
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              Unlock credentials
            </>
          )}
        </button>
      </div>

      {/* Current Credentials */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#12518c]">Current Credentials</h2>
                <p className="text-xs text-slate-500">Company ID {companyId} · active portal logins</p>
              </div>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#12518c]/10 text-[10px] font-bold text-[#12518c]">{filtered.length}</span>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <AddressSearchInput value={search} onChange={v => { setSearch(v); setPage(1) }} />
              <select value={stateFilter} onChange={e => { setStateFilter(e.target.value); setPage(1) }} className={filterSelectClassName(stateFilter)}>
                <option value="">State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={funcFilter} onChange={e => { setFuncFilter(e.target.value); setPage(1) }} className={filterSelectClassName(funcFilter)}>
                <option value="">Function</option>
                {funcs.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filingTypeFilter} onChange={e => { setFilingTypeFilter(e.target.value); setPage(1) }} className={filterSelectClassName(filingTypeFilter)}>
                <option value="">Filing Type</option>
                {filingTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={loginTypeFilter} onChange={e => { setLoginTypeFilter(e.target.value); setPage(1) }} className={filterSelectClassName(loginTypeFilter)}>
                <option value="">Login Type</option>
                {loginTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {filtersActive && (
                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-xs font-semibold text-[#12518c] hover:bg-[#12518c]/10 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => unlocked ? setAddOpen(true) : setUnlockOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 2.5v7M2.5 6h7" />
                </svg>
                Add New
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {credentialColumns.map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      h === 'Active/Inactive' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={credentialColumns.length} className="px-4 py-12 text-center text-sm text-slate-400">No record found!</td>
                </tr>
              ) : (
                filtered.map((c, i) => renderRow(c, i, { actions: true }))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter total={filtered.length} page={page} onPageChange={setPage} />
      </section>

      {/* Past Credentials */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <button
            type="button"
            onClick={() => setPastOpen(o => !o)}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity"
            aria-expanded={pastOpen}
          >
            <svg
              width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className={`text-slate-400 transition-transform flex-shrink-0 ${pastOpen ? 'rotate-90' : ''}`}
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
            <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#12518c]">Past Credentials</h2>
              <p className="text-xs text-slate-500">Archived / inactive logins</p>
            </div>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">{pastCredentials.length}</span>
          </button>
          <AddressSearchInput value={pastSearch} onChange={setPastSearch} />
        </div>

        {pastOpen && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1320px]">
                <thead>
                  <tr className="border-y border-slate-100 bg-slate-50/60">
                    {credentialColumns.map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                          h === 'Active/Inactive' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPast.length === 0 ? (
                    <tr>
                      <td colSpan={credentialColumns.length} className="px-4 py-10 text-center text-sm text-slate-400">No record found!</td>
                    </tr>
                  ) : (
                    filteredPast.map((c, i) => renderRow(c, i, { actions: false }))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 text-xs text-slate-500 border-t border-slate-100">Total: {filteredPast.length}</div>
          </>
        )}
      </section>

      {unlockOpen && (
        <UnlockCredentialsModal
          onClose={() => setUnlockOpen(false)}
          onUnlock={() => { setUnlocked(true); setUnlockOpen(false) }}
        />
      )}

      {deleteId !== null && (
        <AddressModalShell maxWidth="max-w-sm" onClose={() => setDeleteId(null)}>
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-light text-[#bb5757] shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Delete credential?</h3>
                <p className="mt-1 text-xs text-slate-500">This login record will be permanently removed. This action cannot be undone.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
            <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={() => removeCredential(deleteId)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#bb5757] text-white hover:bg-[#a64a4a] transition-colors">
              Delete
            </button>
          </div>
        </AddressModalShell>
      )}

      {addOpen && (
        <AddCredentialModal
          companyId={companyId}
          states={REPORT_STATE_CODES}
          onClose={() => setAddOpen(false)}
          onSave={(data, addAnother) => {
            const nextId = Math.max(0, ...credentials.map(c => c.id)) + 1
            setCredentials(prev => [{ id: nextId, ...data }, ...prev])
            if (!addAnother) setAddOpen(false)
          }}
        />
      )}
    </div>
  )
}

function AddCredentialModal({
  companyId,
  states,
  initialState = '',
  initialFunc = '',
  onClose,
  onSave,
}: {
  companyId: number
  states: string[]
  initialState?: string
  initialFunc?: string
  onClose: () => void
  onSave: (data: Omit<(typeof COMPANY_CREDENTIALS)[number], 'id'>, addAnother: boolean) => void
}) {
  const emptyForm = {
    loginOwner: '',
    shared: false,
    sharedType: '',
    loginType: '',
    state: initialState,
    func: initialFunc,
    filingType: '',
    userName: '',
    loginEmail: '',
    password: '',
    secretQuestion: '',
    pin: '',
    website: '',
    reportingNotes: '',
    licensingNotes: '',
  }

  const [errors, setErrors] = useState<Partial<Record<'loginOwner' | 'loginType' | 'state' | 'func' | 'filingType' | 'userName' | 'password' | 'sharedType', boolean>>>({})
  const [form, setForm] = useState(emptyForm)
  const [showPassword, setShowPassword] = useState(false)

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'shared') {
        if (value === true) {
          if (!prev.loginType) next.loginType = 'Shared'
        } else {
          next.sharedType = ''
        }
      }
      return next
    })
    if (key in { loginOwner: 1, loginType: 1, state: 1, func: 1, filingType: 1, userName: 1, password: 1, sharedType: 1 }) {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const validate = () => {
    const next = {
      loginOwner: !form.loginOwner.trim(),
      loginType: !form.loginType.trim(),
      state: !form.state.trim(),
      func: !form.func.trim(),
      filingType: !form.filingType.trim(),
      userName: !form.userName.trim(),
      password: !form.password.trim(),
      sharedType: form.shared && !form.sharedType.trim(),
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const buildPayload = (): Omit<(typeof COMPANY_CREDENTIALS)[number], 'id'> => ({
    loginOwner: form.loginOwner,
    shared: form.shared,
    sharedType: form.shared ? form.sharedType : '',
    state: form.state,
    func: form.func,
    loginType: form.loginType,
    companyName: form.loginOwner,
    filingType: form.filingType,
    userName: form.userName,
    loginEmail: form.loginEmail,
    password: form.password,
    pin: form.pin,
    website: form.website,
    secretQuestion: form.secretQuestion,
    managedBy: 'CC',
    reportingNotes: form.reportingNotes,
    licensingNotes: form.licensingNotes,
    active: true,
  })

  const handleSave = (addAnother: boolean) => {
    if (!validate()) return
    onSave(buildPayload(), addAnother)
    if (addAnother) {
      setForm(emptyForm)
      setErrors({})
      setShowPassword(false)
    }
  }

  const footerActions = (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={() => handleSave(true)}
        className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#12518c]/30 text-[#12518c] bg-white hover:bg-[#12518c]/5 transition-colors"
      >
        Save And Add New
      </button>
      <button
        type="button"
        onClick={() => handleSave(false)}
        className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
      >
        Save
      </button>
    </div>
  )

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21V7l9-4 9 4v14" />
              <path d="M9 21V12h6v9" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">Company — Add Credential</h3>
            <p className="text-[11px] text-slate-500">Company ID {companyId}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Ownership */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="8" cy="5.5" r="2.5" />
              <path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Ownership</span>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div>
              <OwnershipFormSelect
                label="Login Owner"
                required
                value={form.loginOwner}
                onChange={v => set('loginOwner', v)}
                options={CREDENTIAL_LOGIN_OWNERS}
                placeholder="Select…"
              />
              {errors.loginOwner && <p className="mt-1 text-[11px] text-[#bb5757]">Login Owner is required.</p>}
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3.5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Shared</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Mark if this login is shared across contacts or companies</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.shared}
                onClick={() => set('shared', !form.shared)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.shared ? 'bg-[#12518c]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.shared ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {form.shared && (
              <div>
                <OwnershipFormSelect
                  label="Shared Type"
                  required
                  value={form.sharedType}
                  onChange={v => set('sharedType', v)}
                  options={CREDENTIAL_SHARED_TYPES}
                  placeholder="Select…"
                />
                {errors.sharedType && <p className="mt-1 text-[11px] text-[#bb5757]">Shared Type is required.</p>}
              </div>
            )}
            <div>
              <OwnershipFormSelect
                label="Login Type"
                required
                value={form.loginType}
                onChange={v => set('loginType', v)}
                options={CREDENTIAL_LOGIN_TYPES}
                placeholder="Select…"
              />
              {errors.loginType && <p className="mt-1 text-[11px] text-[#bb5757]">Login Type is required.</p>}
            </div>
          </div>
        </div>

        {/* Jurisdiction */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4">
              <circle cx="8" cy="8" r="5.5" />
              <path d="M8 5.5v3M8 10.5h.01" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Jurisdiction</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <div className="sm:col-span-2">
              <OwnershipFormSelect
                label="State"
                required
                value={form.state}
                onChange={v => set('state', v)}
                options={states}
                placeholder="Select…"
              />
              {errors.state && <p className="mt-1 text-[11px] text-[#bb5757]">State is required.</p>}
            </div>
            <div>
              <OwnershipFormSelect
                label="Function"
                required
                value={form.func}
                onChange={v => set('func', v)}
                options={CREDENTIAL_FUNCTIONS}
                placeholder="Select…"
              />
              {errors.func && <p className="mt-1 text-[11px] text-[#bb5757]">Function is required.</p>}
            </div>
            <div>
              <OwnershipFormSelect
                label="Filing Type"
                required
                value={form.filingType}
                onChange={v => set('filingType', v)}
                options={CREDENTIAL_FILING_TYPES}
                placeholder="Select…"
              />
              {errors.filingType && <p className="mt-1 text-[11px] text-[#bb5757]">Filing Type is required.</p>}
            </div>
          </div>
        </div>

        {/* Access credentials */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="10" height="6.5" rx="1.2" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Access Credentials</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <div>
              <OwnershipFormField
                label="Login ID"
                required
                value={form.userName}
                onChange={v => set('userName', v)}
                placeholder="Username / Login ID"
              />
              {errors.userName && <p className="mt-1 text-[11px] text-[#bb5757]">Login ID is required.</p>}
            </div>
            <OwnershipFormField
              label="Login Email (MFA / Password Reset)"
              type="email"
              value={form.loginEmail}
              onChange={v => set('loginEmail', v)}
              placeholder="email@example.com"
            />
            <div>
              <OwnershipFormLabel required>Password</OwnershipFormLabel>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-9 pl-3 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                      <path d="M2 2l12 12M6.5 6.7A3 3 0 0 0 8 11a3 3 0 0 0 2.9-2.2" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                      <circle cx="8" cy="8" r="1.75" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-[#bb5757]">Password is required.</p>}
            </div>
            <OwnershipFormField
              label="Secret?"
              value={form.secretQuestion}
              onChange={v => set('secretQuestion', v)}
              placeholder="Secret question / answer"
            />
            <OwnershipFormField
              label="Pin"
              value={form.pin}
              onChange={v => set('pin', v)}
              placeholder="PIN"
            />
            <OwnershipFormField
              label="Website"
              value={form.website}
              onChange={v => set('website', v)}
              placeholder="https://…"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <path d="M3.5 3.5h9M3.5 6.5h9M3.5 9.5h6" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Notes</span>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div>
              <OwnershipFormLabel>Reporting Notes</OwnershipFormLabel>
              <textarea
                value={form.reportingNotes}
                onChange={e => set('reportingNotes', e.target.value)}
                rows={3}
                placeholder="Notes for reporting…"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-y"
              />
            </div>
            <div>
              <OwnershipFormLabel>Licensing Notes</OwnershipFormLabel>
              <textarea
                value={form.licensingNotes}
                onChange={e => set('licensingNotes', e.target.value)}
                rows={3}
                placeholder="Notes for licensing…"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-y"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
        {footerActions}
      </div>
    </AddressModalShell>
  )
}

function licenseDateToInput(value: string) {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  return match ? `${match[3]}-${match[1]}-${match[2]}` : value
}

function licenseDateToDisplay(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[2]}-${match[3]}-${match[1]}` : value
}

function AddLicenseModal({
  companyId,
  license,
  onClose,
  onSave,
}: {
  companyId: number
  license?: (typeof COMPANY_LICENSES)[number] | null
  onClose: () => void
  onSave: (
    data: {
      state: string
      cityCounty: string
      func: string
      item: string
      itemName: string
      licenseNo: string
      renewalDue: string
      expiration: string
      actionIn: string
      status: string
      comment: string
    },
    addAnother: boolean
  ) => void
}) {
  const isEdit = Boolean(license)
  const STATE_CODES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'TTB', 'AI',
  ]
  const FUNCTIONS = ['DTC', 'Wholesale', 'Operational']
  const ITEM_NAMES = [
    'Wine Direct Shipper Permit',
    'Direct Shipper Permit',
    'Winegrower Bond',
    'Winegrower',
    'Basic Permit',
    'Out-of-State Shipper',
    'Nonresident Seller Permit',
    'Certificate of Approval',
    'Certificate of Authority',
  ]

  const [errors, setErrors] = useState<Partial<Record<'licenseDept' | 'jurisdiction' | 'state' | 'func' | 'itemName' | 'renewalDue' | 'expiration', boolean>>>({})
  const [form, setForm] = useState(() =>
    license
      ? {
          licenseDept: license.func === 'Operational' ? 'OPS' : 'OOS',
          jurisdiction: license.state === 'TTB' ? 'Federal' : 'State',
          state: license.state,
          func: license.func,
          itemName: license.itemName,
          licenseNo: license.licenseNo,
          doesNotExpire: !license.expiration,
          renewalDue: licenseDateToInput(license.renewalDue),
          expiration: licenseDateToInput(license.expiration),
          status: license.status,
          comment: license.comment,
        }
      : {
          licenseDept: 'OPS',
          jurisdiction: 'State',
          state: '',
          func: '',
          itemName: '',
          licenseNo: '',
          doesNotExpire: false,
          renewalDue: '',
          expiration: '',
          status: 'Active',
          comment: '',
        }
  )
  const [secondaryIds, setSecondaryIds] = useState<{ id: number; label: string; value: string }[]>([])

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'doesNotExpire' && value === true) {
        next.expiration = ''
        next.renewalDue = ''
      }
      if (key === 'jurisdiction' && value === 'Federal') {
        next.state = 'TTB'
      }
      return next
    })
    if (key === 'doesNotExpire' && value === true) {
      setErrors(prev => ({ ...prev, renewalDue: false, expiration: false }))
    }
    if (typeof key === 'string' && key in { licenseDept: 1, jurisdiction: 1, state: 1, func: 1, itemName: 1, renewalDue: 1, expiration: 1 }) {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const addSecondary = () => {
    setSecondaryIds(prev => [...prev, { id: Date.now(), label: '', value: '' }])
  }

  const updateSecondary = (id: number, key: 'label' | 'value', value: string) => {
    setSecondaryIds(prev => prev.map(s => (s.id === id ? { ...s, [key]: value } : s)))
  }

  const removeSecondary = (id: number) => {
    setSecondaryIds(prev => prev.filter(s => s.id !== id))
  }

  const validate = () => {
    const next = {
      licenseDept: !form.licenseDept,
      jurisdiction: !form.jurisdiction,
      state: !form.state.trim(),
      func: !form.func.trim(),
      itemName: !form.itemName.trim(),
      renewalDue: !form.doesNotExpire && !form.renewalDue.trim(),
      expiration: !form.doesNotExpire && !form.expiration.trim(),
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const buildPayload = () => {
    const item = form.itemName.includes('Bond')
      ? 'Bond'
      : form.itemName.includes('Type 02') || form.itemName === 'Winegrower'
        ? 'Type 02'
        : form.itemName.includes('Shipper') || form.itemName.includes('Direct')
          ? 'Direct Shippers'
          : form.itemName
    return {
      state: form.state,
      cityCounty: license?.cityCounty ?? '',
      func: form.func,
      item,
      itemName: form.itemName,
      licenseNo: form.licenseNo || secondaryIds.map(s => s.value).filter(Boolean).join(', '),
      renewalDue: licenseDateToDisplay(form.renewalDue),
      expiration: form.doesNotExpire ? '' : licenseDateToDisplay(form.expiration),
      actionIn: form.doesNotExpire ? '—' : (license?.actionIn ?? 'Expired'),
      status: form.status,
      comment: form.comment.trim(),
    }
  }

  const handleSave = (addAnother: boolean) => {
    if (!validate()) return
    onSave(buildPayload(), addAnother)
    if (addAnother) {
      setForm({
        licenseDept: form.licenseDept,
        jurisdiction: form.jurisdiction,
        state: form.jurisdiction === 'Federal' ? 'TTB' : '',
        func: '',
        itemName: '',
        licenseNo: '',
        doesNotExpire: false,
        renewalDue: '',
        expiration: '',
        status: 'Active',
        comment: '',
      })
      setSecondaryIds([])
      setErrors({})
    }
  }

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M4 2.5h5.5L13 6v7.5H4V2.5z" />
              <path d="M9.5 2.5V6H13" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{isEdit ? 'Company — Update License' : 'Company — Add License'}</h3>
            <p className="text-[11px] text-slate-500 truncate">
              {isEdit && license ? `${license.state} · ${license.func}${license.licenseNo ? ` · ${license.licenseNo}` : ''}` : `Company ID ${companyId}`}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Type selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OwnershipRadioGroup
            label="Type of License"
            required
            value={form.licenseDept}
            onChange={v => set('licenseDept', v)}
            options={[
              { value: 'OPS', label: 'OPS' },
              { value: 'OOS', label: 'OOS' },
            ]}
          />
          <OwnershipRadioGroup
            label="Type"
            required
            value={form.jurisdiction}
            onChange={v => set('jurisdiction', v)}
            options={[
              { value: 'Federal', label: 'Federal' },
              { value: 'State', label: 'State' },
            ]}
          />
        </div>

        {/* License Setup */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4">
              <circle cx="8" cy="8" r="5.5" />
              <path d="M8 5.5v3M8 10.5h.01" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">License Setup</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <div>
              <OwnershipFormSelect
                label="State"
                required
                value={form.state}
                onChange={v => set('state', v)}
                options={form.jurisdiction === 'Federal' ? ['TTB'] : STATE_CODES.filter(s => s !== 'TTB')}
                placeholder="Select…"
                readOnly={form.jurisdiction === 'Federal'}
              />
              {errors.state && <p className="mt-1 text-[11px] text-[#bb5757]">State is required.</p>}
            </div>
            <div>
              <OwnershipFormSelect
                label="Function"
                required
                value={form.func}
                onChange={v => set('func', v)}
                options={FUNCTIONS.includes(form.func) || !form.func ? FUNCTIONS : [form.func, ...FUNCTIONS]}
                placeholder="Select…"
              />
              {errors.func && <p className="mt-1 text-[11px] text-[#bb5757]">Function is required.</p>}
            </div>
            {isEdit && (
              <OwnershipFormSelect
                label="Status"
                required
                value={form.status}
                onChange={v => set('status', v)}
                options={['Active', 'Inactive']}
                placeholder="Select…"
              />
            )}
          </div>
        </div>

        {/* License Information */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <path d="M4 2.5h5.5L13 6v7.5H4V2.5z" />
              <path d="M9.5 2.5V6H13" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">License Information</span>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <div>
              <OwnershipFormSelect
                label="Item Name"
                required
                value={form.itemName}
                onChange={v => set('itemName', v)}
                options={ITEM_NAMES.includes(form.itemName) || !form.itemName ? ITEM_NAMES : [form.itemName, ...ITEM_NAMES]}
                placeholder="Select…"
              />
              {errors.itemName && <p className="mt-1 text-[11px] text-[#bb5757]">Item Name is required.</p>}
            </div>
            <OwnershipFormField
              label="License / Permit Number"
              value={form.licenseNo}
              onChange={v => set('licenseNo', v)}
              placeholder="Optional primary number"
            />

            <div className="space-y-3">
              {secondaryIds.map(s => (
                <div key={s.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                  <OwnershipFormField label="Identifier Label" value={s.label} onChange={v => updateSecondary(s.id, 'label', v)} placeholder="e.g. Account ID" />
                  <OwnershipFormField label="Identifier Value" value={s.value} onChange={v => updateSecondary(s.id, 'value', v)} placeholder="Number / code" />
                  <button
                    type="button"
                    onClick={() => removeSecondary(s.id)}
                    className="h-9 px-3 mb-0.5 rounded-lg text-xs font-semibold text-[#bb5757] border border-danger-border hover:bg-danger-light transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addSecondary}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 2.5v7M2.5 6h7" />
                </svg>
                Add Secondary Identifier
              </button>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Optional — add another related number, such as an account ID, Letter #, or other assigned identifier.
              </p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <rect x="2.5" y="3.5" width="11" height="10" rx="1.2" />
              <path d="M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Dates</span>
          </div>
          <div className="p-4 space-y-4 bg-white">
            <label className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.doesNotExpire}
                onClick={() => set('doesNotExpire', !form.doesNotExpire)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.doesNotExpire ? 'bg-[#12518c]' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.doesNotExpire ? 'translate-x-5' : ''}`} />
              </button>
              <span className="text-sm text-slate-700">Does Not Expire</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <OwnershipFormField
                  label="Renewal Due Date"
                  required={!form.doesNotExpire}
                  type="date"
                  value={form.renewalDue}
                  onChange={v => set('renewalDue', v)}
                  readOnly={form.doesNotExpire}
                />
                {errors.renewalDue && <p className="mt-1 text-[11px] text-[#bb5757]">Renewal Due Date is required.</p>}
              </div>
              <div>
                <OwnershipFormField
                  label="Expiration Date"
                  required={!form.doesNotExpire}
                  type="date"
                  value={form.expiration}
                  onChange={v => set('expiration', v)}
                  readOnly={form.doesNotExpire}
                />
                {errors.expiration && <p className="mt-1 text-[11px] text-[#bb5757]">Expiration Date is required.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div>
          <OwnershipFormLabel>Comments</OwnershipFormLabel>
          <p className="text-[11px] text-slate-400 mb-2 -mt-1">Comments entered here appear on the License Summary and export.</p>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-slate-100 bg-slate-50">
              {['B', 'I', 'U', 'S', '•', '1.', '❝', '🔗'].map(btn => (
                <button key={btn} type="button" className="px-2 py-0.5 rounded text-[11px] font-semibold text-slate-500 hover:bg-white transition-colors">
                  {btn}
                </button>
              ))}
            </div>
            <textarea
              value={form.comment}
              onChange={e => set('comment', e.target.value)}
              rows={4}
              placeholder="Add comments…"
              className="w-full px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y min-h-[96px]"
            />
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#12518c]/30 text-[#12518c] bg-white hover:bg-[#12518c]/5 transition-colors"
          >
            Save And Add New
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
        >
          {isEdit ? 'Update License' : 'Save'}
        </button>
      </div>
    </AddressModalShell>
  )
}

function ReportToggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 cursor-pointer select-none">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#12518c]' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

function ViewSectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 rounded-t-xl border-b border-[#12518c]/10 bg-[#12518c]/5 px-4 py-2.5">
      <span className="text-[#12518c]">{icon}</span>
      <h4 className="text-xs font-semibold text-slate-800">{title}</h4>
    </div>
  )
}

function ViewField({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-1 text-[11px] font-medium text-slate-500">{label}</p>
      <p className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 truncate" title={value}>
        {value || '—'}
      </p>
    </div>
  )
}

function ViewRadioGroup({ label, options, selected }: { label: string; options: string[]; selected: string }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-slate-500">{label}</p>
      <div className="flex items-center gap-4">
        {options.map(option => (
          <span key={option} className={`inline-flex items-center gap-1.5 text-sm ${option === selected ? 'font-semibold text-slate-900' : 'text-slate-400'}`}>
            <span className={`h-3.5 w-3.5 rounded-full border-4 ${option === selected ? 'border-[#12518c]' : 'border-slate-300'}`} />
            {option}
          </span>
        ))}
      </div>
    </div>
  )
}

function ViewToggle({ label, on }: { label: string; on: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-700">{label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full ${on ? 'bg-[#12518c]' : 'bg-slate-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
      <span className={`text-xs font-medium ${on ? 'text-[#12518c]' : 'text-slate-400'}`}>{on ? 'Yes' : 'No'}</span>
    </div>
  )
}

function ViewLicenseModal({
  license,
  onClose,
  onEdit,
}: {
  license: (typeof COMPANY_LICENSES)[number]
  onClose: () => void
  onEdit: () => void
}) {
  const isFederal = license.state === 'TTB'
  const noLicenseNumber = !license.licenseNo
  const doesNotExpire = !license.expiration

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M4 2.5h5.5L13 6v7.5H4V2.5z" />
              <path d="M9.5 2.5V6H13" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">Company — View License</h3>
            <p className="text-[11px] text-slate-500 truncate">
              {license.state} · {license.func} · {license.licenseNo || 'N/A'}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ViewRadioGroup label="Type of License" options={['OPS', 'OOS']} selected={license.func === 'Operational' ? 'OPS' : 'OOS'} />
          <ViewRadioGroup label="Type" options={['Federal', 'State']} selected={isFederal ? 'Federal' : 'State'} />
        </div>

        <section className="rounded-xl border border-slate-200 overflow-hidden">
          <ViewSectionHeader
            title="License Setup"
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <path d="M2.5 5h11M2.5 8h11M2.5 11h7" />
              </svg>
            }
          />
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ViewField label="State" value={license.state} />
              <ViewField label="Function" value={license.func} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2.5">Item Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ViewField label="Item" value={license.item} />
                <div>
                  <p className="mb-1 text-[11px] font-medium text-slate-500">Status</p>
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    license.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {license.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ViewField label="Shipping Setup" value="Client License" />
              <ViewField label="City / County" value={license.cityCounty} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 overflow-hidden">
          <ViewSectionHeader
            title="License Information"
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
                <path d="M5.5 6.5h5M5.5 9.5h3" />
              </svg>
            }
          />
          <div className="p-4 space-y-4">
            <ViewField label="Item Name" value={license.itemName} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <p className="mb-1.5 text-[11px] font-medium text-slate-500">License Number</p>
                <ViewToggle label="No License Number" on={noLicenseNumber} />
              </div>
              {!noLicenseNumber && (
                <ViewField label="License / Permit Number" value={license.licenseNo} />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 overflow-hidden">
          <ViewSectionHeader
            title="Dates"
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <rect x="2.5" y="3.5" width="11" height="9.5" rx="1.5" />
                <path d="M2.5 6.5h11M5.5 2v2.5M10.5 2v2.5" />
              </svg>
            }
          />
          <div className="p-4 space-y-4">
            <ViewToggle label="Does Not Expire" on={doesNotExpire} />
            {!doesNotExpire && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ViewField label="Renewal Due" value={license.renewalDue} />
                <ViewField label="Expiration" value={license.expiration} />
                <div>
                  <p className="mb-1 text-[11px] font-medium text-slate-500">Action In</p>
                  {license.actionIn === 'Expired' ? (
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#bb5757] text-white">Expired</span>
                  ) : (
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">{license.actionIn} days</span>
                  )}
                </div>
              </div>
            )}
            {doesNotExpire && license.actionIn === 'Expired' && (
              <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#bb5757] text-white">Expired</span>
            )}
          </div>
        </section>

        {license.comment && (
          <section className="rounded-xl border border-slate-200 overflow-hidden">
            <ViewSectionHeader
              title="Comment"
              icon={
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 3.5h11v7h-6l-2.5 2v-2h-2.5v-7z" />
                </svg>
              }
            />
            <div className="p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{license.comment}</p>
            </div>
          </section>
        )}
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
          </svg>
          Edit
        </button>
      </div>
    </AddressModalShell>
  )
}

const REPORT_NAME_OPTIONS = [
  'Direct Shipper Report',
  'Excise Tax Return',
  'Sales & Use Tax Return',
  'Operations Report',
  'Bottle Bill Report',
]

function LicenseReportModal({
  license,
  companyId,
  onClose,
  onSave,
}: {
  license: (typeof COMPANY_LICENSES)[number]
  companyId: number
  onClose: () => void
  onSave: (data: Omit<(typeof COMPANY_REPORTING)[number], 'id'>) => void
}) {
  type Identifier = { id: number; description: string; number: string }

  const [errors, setErrors] = useState<Partial<Record<'reportName' | 'type' | 'filingFrequency' | 'filingType' | 'credential', boolean>>>({})
  const [manualClient, setManualClient] = useState(false)
  const [shipDateBased, setShipDateBased] = useState(false)
  const [futureFrequency, setFutureFrequency] = useState(false)
  const [addCredentialOpen, setAddCredentialOpen] = useState(false)
  const [customCredentials, setCustomCredentials] = useState<string[]>([])
  const [credentialJustAdded, setCredentialJustAdded] = useState(false)
  const [identifiers, setIdentifiers] = useState<Identifier[]>([])
  const [form, setForm] = useState({
    reportName: '',
    reportType: '',
    filingFrequency: '',
    filingType: '',
    accountNo: '',
    effectiveDate: '',
    filingNotes: '',
    futureFilingFrequency: '',
    futureEffectiveDate: '',
    credential: '',
  })

  const credentialOptions = [...CREDENTIAL_LOGIN_OWNERS, ...customCredentials]

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'reportName' || key === 'filingFrequency' || key === 'filingType' || key === 'credential') {
      setErrors(prev => ({ ...prev, [key === 'reportName' ? 'reportName' : key]: false }))
    }
    if (key === 'reportType') setErrors(prev => ({ ...prev, type: false }))
  }

  const nickname = form.reportName
    ? `${license.state} ${form.reportName}${form.filingFrequency ? ` (${form.filingFrequency})` : ''}`
    : ''

  const addIdentifier = () => {
    setIdentifiers(prev => [...prev, { id: Math.max(0, ...prev.map(x => x.id)) + 1, description: '', number: '' }])
  }

  const setIdentifier = (id: number, key: 'description' | 'number', value: string) => {
    setIdentifiers(prev => prev.map(x => (x.id === id ? { ...x, [key]: value } : x)))
  }

  const removeIdentifier = (id: number) => {
    setIdentifiers(prev => prev.filter(x => x.id !== id))
  }

  const handleSave = () => {
    const next = {
      reportName: !form.reportName,
      type: !form.reportType,
      filingFrequency: !form.filingFrequency,
      filingType: !form.filingType,
      credential: !form.credential,
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    onSave({
      state: license.state,
      func: license.func,
      filingFrequency: form.filingFrequency,
      type: form.reportType,
      filingType: form.filingType,
      accountNo: form.accountNo.trim(),
      dueDate: '',
      login: form.credential,
      password: '••••••••',
      pin: '',
      reportingNotes: form.reportName,
      filingNotes: form.filingNotes.trim(),
      active: true,
    })
  }

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M4 2.5h5.5L13 6v7.5H4V2.5z" />
              <path d="M9.5 2.5V6H13" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              Company — Add Report
            </h3>
            <p className="text-[11px] text-slate-500 truncate">
              {license.state} · {license.func} · {license.licenseNo || 'N/A'}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        <div className="flex items-start gap-2.5 rounded-xl border border-[#e1c16e]/60 bg-[#e1c16e]/15 px-3.5 py-2.5">
          <svg className="mt-0.5 flex-shrink-0 text-[#e1c16e]" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 5v3.5M8 11h.01" />
          </svg>
          <p className="text-xs text-[#73591e]">Some values are pulled from existing Licensing/Reporting data.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ReportToggle label="Manual Client" checked={manualClient} onChange={setManualClient} />
          <ReportToggle label="Sends data based on Ship date" checked={shipDateBased} onChange={setShipDateBased} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <OwnershipFormSelect label="Report Name" required value={form.reportName} onChange={v => set('reportName', v)} options={REPORT_NAME_OPTIONS} placeholder="Select…" />
            {errors.reportName && <p className="mt-1 text-[11px] text-[#bb5757]">Report name is required.</p>}
          </div>
          <OwnershipFormField label="Report Nickname" value={nickname} onChange={() => {}} readOnly placeholder="Generated from report name" />
          <div>
            <OwnershipFormSelect label="Report Type" required value={form.reportType} onChange={v => set('reportType', v)} options={REPORT_TYPES} placeholder="Select…" />
            {errors.type && <p className="mt-1 text-[11px] text-[#bb5757]">Report type is required.</p>}
          </div>
          <div>
            <OwnershipFormSelect label="Filing Frequency" required value={form.filingFrequency} onChange={v => set('filingFrequency', v)} options={REPORT_FREQUENCIES} placeholder="Select…" />
            {errors.filingFrequency && <p className="mt-1 text-[11px] text-[#bb5757]">Filing frequency is required.</p>}
          </div>
          <div>
            <OwnershipFormSelect label="Filing Type" required value={form.filingType} onChange={v => set('filingType', v)} options={REPORT_FILING_TYPES} placeholder="Select…" />
            {errors.filingType && <p className="mt-1 text-[11px] text-[#bb5757]">Filing type is required.</p>}
          </div>
          <OwnershipFormField label="Account Number" value={form.accountNo} onChange={v => set('accountNo', v)} placeholder="Enter account number" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-700">Secondary Identifiers</p>
              <p className="text-[11px] text-slate-500">Optional — account ID, letter #, or other assigned identifiers</p>
            </div>
            <button
              type="button"
              onClick={addIdentifier}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
              Add Identifier
            </button>
          </div>
          {identifiers.length > 0 && (
            <div className="space-y-2">
              {identifiers.map(identifier => (
                <div key={identifier.id} className="flex items-end gap-2">
                  <div className="flex-1">
                    <OwnershipFormField label="Identifier Description" value={identifier.description} onChange={v => setIdentifier(identifier.id, 'description', v)} placeholder="Account ID, Letter #, etc." />
                  </div>
                  <div className="flex-1">
                    <OwnershipFormField label="Identifier #" value={identifier.number} onChange={v => setIdentifier(identifier.id, 'number', v)} placeholder="Enter identifier number" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIdentifier(identifier.id)}
                    className="mb-1 p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors flex-shrink-0"
                    title="Remove identifier"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M3 3l8 8M11 3l-8 8" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <OwnershipFormField label="Reporting Effective Date" type="date" value={form.effectiveDate} onChange={v => set('effectiveDate', v)} />
          <OwnershipFormField label="Filing Notes" value={form.filingNotes} onChange={v => set('filingNotes', v)} placeholder="Optional notes" />
        </div>

        <div className="space-y-3">
          <ReportToggle label="Add Future Filing Frequency" checked={futureFrequency} onChange={setFutureFrequency} />
          {futureFrequency && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <OwnershipFormSelect label="Future Filing Frequency" value={form.futureFilingFrequency} onChange={v => set('futureFilingFrequency', v)} options={REPORT_FREQUENCIES} placeholder="Select…" />
              <OwnershipFormField label="Effective From" type="date" value={form.futureEffectiveDate} onChange={v => set('futureEffectiveDate', v)} />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-700">Credential <span className="text-[#bb5757]">*</span></p>
              <p className="text-[11px] text-slate-500">Link an existing login or create a new one for this report</p>
            </div>
            <button
              type="button"
              onClick={() => setAddCredentialOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
              Add New Credential
            </button>
          </div>
          <div>
            <OwnershipFormSelect label="Credential" required value={form.credential} onChange={v => set('credential', v)} options={credentialOptions} placeholder="Select…" />
            {errors.credential && <p className="mt-1 text-[11px] text-[#bb5757]">Select a credential or add a new one.</p>}
            {credentialJustAdded && form.credential && (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 6.5l2.5 2.5L10 3" />
                </svg>
                New credential created and selected
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
        >
          Save
        </button>
      </div>

      {addCredentialOpen && (
        <AddCredentialModal
          companyId={companyId}
          states={REPORT_STATE_CODES}
          initialState={license.state}
          initialFunc={license.func}
          onClose={() => setAddCredentialOpen(false)}
          onSave={(data) => {
            const label = data.loginOwner || data.userName
            setCustomCredentials(prev => (prev.includes(label) ? prev : [...prev, label]))
            setForm(prev => ({ ...prev, credential: label }))
            setErrors(prev => ({ ...prev, credential: false }))
            setCredentialJustAdded(true)
            setAddCredentialOpen(false)
          }}
        />
      )}
    </AddressModalShell>
  )
}

function AddReportModal({
  initial,
  states,
  onClose,
  onSave,
}: {
  initial: (typeof COMPANY_REPORTING)[number] | null
  states: string[]
  onClose: () => void
  onSave: (data: Omit<(typeof COMPANY_REPORTING)[number], 'id'>, addAnother: boolean) => void
}) {
  const isEdit = !!initial
  const [errors, setErrors] = useState<Partial<Record<'state' | 'func' | 'type' | 'filingType' | 'filingFrequency', boolean>>>({})
  const [form, setForm] = useState({
    state: initial?.state ?? '',
    func: initial?.func ?? '',
    type: initial?.type ?? '',
    filingType: initial?.filingType ?? 'Online',
    filingFrequency: initial?.filingFrequency ?? '',
    dueDate: initial?.dueDate ?? '',
    accountNo: initial?.accountNo ?? '',
    login: initial?.login ?? '',
    password: initial?.password ?? '',
    pin: initial?.pin ?? '',
    reportingNotes: initial?.reportingNotes ?? '',
    filingNotes: initial?.filingNotes ?? '',
    active: initial?.active ?? true,
  })

  const set = (key: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key in { state: 1, func: 1, type: 1, filingType: 1, filingFrequency: 1 }) {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const validate = () => {
    const next = {
      state: !form.state.trim(),
      func: !form.func.trim(),
      type: !form.type.trim(),
      filingType: !form.filingType.trim(),
      filingFrequency: !form.filingFrequency.trim(),
    }
    setErrors(next)
    return !Object.values(next).some(Boolean)
  }

  const handleSave = (addAnother: boolean) => {
    if (!validate()) return
    onSave({ ...form }, addAnother)
    if (addAnother && !isEdit) {
      setForm({
        state: '',
        func: '',
        type: '',
        filingType: 'Online',
        filingFrequency: '',
        dueDate: '',
        accountNo: '',
        login: '',
        password: '',
        pin: '',
        reportingNotes: '',
        filingNotes: '',
        active: true,
      })
      setErrors({})
    }
  }

  return (
    <AddressModalShell maxWidth="max-w-2xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-9 h-9 rounded-xl bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 2.5h5.5L13 6v7.5H4V2.5z" />
              <path d="M9.5 2.5V6H13M6 8.5h4M6 11h4" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">{isEdit ? 'Edit Report' : 'Add Report'}</h3>
            <p className="text-[11px] text-slate-500">Filing schedule &amp; access credentials</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
        {/* Report Setup */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <circle cx="8" cy="8" r="5.5" />
              <path d="M8 5.5v3M8 10.5h.01" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Report Setup</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <div>
              <OwnershipFormSelect label="State" required value={form.state} onChange={v => set('state', v)} options={states} placeholder="Select…" />
              {errors.state && <p className="mt-1 text-[11px] text-[#bb5757]">State is required.</p>}
            </div>
            <div>
              <OwnershipFormSelect label="Function" required value={form.func} onChange={v => set('func', v)} options={REPORT_FUNCTIONS} placeholder="Select…" />
              {errors.func && <p className="mt-1 text-[11px] text-[#bb5757]">Function is required.</p>}
            </div>
            <div>
              <OwnershipFormSelect label="Type" required value={form.type} onChange={v => set('type', v)} options={REPORT_TYPES} placeholder="Select…" />
              {errors.type && <p className="mt-1 text-[11px] text-[#bb5757]">Type is required.</p>}
            </div>
            <div>
              <OwnershipFormSelect label="Filing Frequency" required value={form.filingFrequency} onChange={v => set('filingFrequency', v)} options={REPORT_FREQUENCIES} placeholder="Select…" />
              {errors.filingFrequency && <p className="mt-1 text-[11px] text-[#bb5757]">Filing Frequency is required.</p>}
            </div>
            <div className="sm:col-span-2">
              <OwnershipRadioGroup
                label="Filing Type"
                required
                value={form.filingType}
                onChange={v => set('filingType', v)}
                options={REPORT_FILING_TYPES.map(t => ({ value: t, label: t }))}
              />
              {errors.filingType && <p className="mt-1 text-[11px] text-[#bb5757]">Filing Type is required.</p>}
            </div>
            <OwnershipFormField label="Due Date" value={form.dueDate} onChange={v => set('dueDate', v)} placeholder="e.g. 20th, 31st" />
          </div>
        </div>

        {/* Access & Credentials */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="10" height="6.5" rx="1.2" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Access &amp; Credentials</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <OwnershipFormField label="Account No" value={form.accountNo} onChange={v => set('accountNo', v)} placeholder="Account number" />
            <OwnershipFormField label="Login" value={form.login} onChange={v => set('login', v)} placeholder="Username" />
            <OwnershipFormField label="Password" value={form.password} onChange={v => set('password', v)} placeholder="Password" />
            <OwnershipFormField label="Pin" value={form.pin} onChange={v => set('pin', v)} placeholder="PIN" />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#12518c]/5 border-b border-[#12518c]/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#12518c" strokeWidth="1.4" strokeLinecap="round">
              <path d="M3.5 3.5h9M3.5 6.5h9M3.5 9.5h6" />
            </svg>
            <span className="text-xs font-semibold text-[#12518c] uppercase tracking-wide">Notes</span>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <div>
              <OwnershipFormLabel>Reporting Notes</OwnershipFormLabel>
              <textarea
                value={form.reportingNotes}
                onChange={e => set('reportingNotes', e.target.value)}
                rows={3}
                placeholder="Internal reporting notes…"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-y"
              />
            </div>
            <div>
              <OwnershipFormLabel>Filing Notes</OwnershipFormLabel>
              <textarea
                value={form.filingNotes}
                onChange={e => set('filingNotes', e.target.value)}
                rows={3}
                placeholder="Filing instructions…"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <label className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.active}
            onClick={() => set('active', !form.active)}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${form.active ? 'bg-[#12518c]' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
          </button>
          <span className="text-sm text-slate-700">{form.active ? 'Active' : 'Inactive'}</span>
        </label>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        {!isEdit && (
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-4 py-2 rounded-lg text-xs font-semibold border border-[#12518c]/30 text-[#12518c] bg-white hover:bg-[#12518c]/5 transition-colors"
          >
            Save And Add New
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSave(false)}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
        >
          Save
        </button>
      </div>
    </AddressModalShell>
  )
}

function CompanyAddressesPage({ companyId }: { companyId: number }) {
  const [currentAddresses, setCurrentAddresses] = useState<AddressRow[]>(COMPANY_ADDRESSES)
  const [pastAddresses] = useState<AddressRow[]>(PAST_ADDRESSES)
  const [currentSearch, setCurrentSearch] = useState('')
  const [pastSearch, setPastSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingInactiveId, setPendingInactiveId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reasonOpen, setReasonOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [reasonNote, setReasonNote] = useState('')
  const [reasonError, setReasonError] = useState(false)
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view' | null>(null)
  const [editingAddress, setEditingAddress] = useState<AddressRow | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)

  const filterAddresses = (list: AddressRow[], q: string) =>
    list.filter(a =>
      !q ||
      [a.label, a.street, a.city, a.state, a.zip, a.country].some(v =>
        v.toLowerCase().includes(q.toLowerCase())
      )
    )

  const filteredCurrent = filterAddresses(currentAddresses, currentSearch)
  const filteredPast = filterAddresses(pastAddresses, pastSearch)
  const pendingAddress = currentAddresses.find(a => a.id === pendingInactiveId) ?? null

  const requestInactive = (id: number) => {
    setPendingInactiveId(id)
    setConfirmOpen(true)
    setReasonOpen(false)
    setSuccessOpen(false)
    setReasonNote('')
    setReasonError(false)
  }

  const closeInactiveFlow = () => {
    setConfirmOpen(false)
    setReasonOpen(false)
    setSuccessOpen(false)
    setPendingInactiveId(null)
    setReasonNote('')
    setReasonError(false)
  }

  const confirmYes = () => {
    setConfirmOpen(false)
    setReasonOpen(true)
  }

  const submitReason = () => {
    if (!reasonNote.trim()) {
      setReasonError(true)
      return
    }
    setReasonOpen(false)
    setSuccessOpen(true)
  }

  const acknowledgeSuccess = () => {
    closeInactiveFlow()
  }

  const openAdd = () => {
    setEditingAddress(null)
    setFormMode('add')
  }

  const openView = (address: AddressRow) => {
    setEditingAddress(address)
    setFormMode('view')
  }

  const openEdit = (address: AddressRow) => {
    setEditingAddress(address)
    setFormMode('edit')
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingAddress(null)
  }

  const saveAddress = (data: Omit<AddressRow, 'id' | 'active'> & { id?: number }) => {
    if (formMode === 'edit' && data.id != null) {
      setCurrentAddresses(prev =>
        prev.map(a => (a.id === data.id ? { ...a, ...data, active: a.active } : a))
      )
    } else {
      const nextId = Math.max(0, ...currentAddresses.map(a => a.id), ...pastAddresses.map(a => a.id)) + 1
      setCurrentAddresses(prev => [
        { id: nextId, label: data.label, street: data.street, city: data.city, state: data.state, zip: data.zip, country: data.country, active: true },
        ...prev,
      ])
    }
    closeForm()
  }

  const removeAddress = (id: number) => {
    setCurrentAddresses(prev => prev.filter(a => a.id !== id))
    setDeleteConfirmId(null)
  }

  return (
    <div className="space-y-4 animate-[fadeIn_0.25s_ease-out]">
      {/* Current Addresses */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#12518c]">Current Addresses</h2>
              <p className="text-xs text-slate-500">Active locations for this company</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AddressSearchInput value={currentSearch} onChange={setCurrentSearch} />
            <button
              type="button"
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              title="Column settings"
            >
              <GridViewIcon />
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 2.5v7M2.5 6h7" />
              </svg>
              Add New
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {['Location Name', 'Street', 'City', 'State', 'Zip Code', 'Country', 'Active/Inactive', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i >= 6 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCurrent.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">
                    No record Found!
                  </td>
                </tr>
              ) : (
                filteredCurrent.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-slate-100 transition-colors hover:bg-slate-50/80 ${
                      i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 whitespace-nowrap">{a.label}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.street}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.city}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.state}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.zip}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{a.country}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <AddressActiveToggle
                          active={a.active}
                          onChange={() => {
                            if (a.active) requestInactive(a.id)
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openView(a)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#12518c] hover:bg-[#12518c]/10 transition-colors"
                          title="View"
                        >
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
                            <circle cx="8" cy="8" r="1.75" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                            <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(a.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-[#bb5757] hover:bg-danger-light transition-colors"
                          title="Delete"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddressTableFooter
          total={filteredCurrent.length}
          page={currentPage}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* Past Addresses */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#12518c]">Past Addresses</h2>
              <p className="text-xs text-slate-500">Historical locations no longer in use</p>
            </div>
          </div>
          <AddressSearchInput value={pastSearch} onChange={setPastSearch} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-y border-slate-100 bg-slate-50/60">
                {['Location Name', 'Street', 'City', 'State', 'Zip Code', 'Country', 'Active/Inactive'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                      i === 6 ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPast.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center">
                    <p className="text-sm font-medium text-slate-500">No record Found!</p>
                    <p className="text-xs text-slate-400 mt-1">Past addresses will appear here when available</p>
                  </td>
                </tr>
              ) : (
                filteredPast.map((a, i) => (
                  <tr key={a.id} className={`border-b border-slate-100 ${i % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'}`}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{a.label}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.street}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.city}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.state}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.zip}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{a.country}</td>
                    <td className="px-4 py-3 text-center">
                      <AddressActiveToggle active={a.active} onChange={() => {}} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <AddressTableFooter total={filteredPast.length} page={1} onPageChange={() => {}} />
      </section>

      {confirmOpen && (
        <AddressConfirmInactiveModal
          onClose={closeInactiveFlow}
          onYes={confirmYes}
          onNo={closeInactiveFlow}
        />
      )}

      {reasonOpen && pendingAddress && (
        <AddressReasonModal
          companyId={companyId}
          locationName={pendingAddress.label}
          note={reasonNote}
          error={reasonError}
          onNoteChange={v => {
            setReasonNote(v)
            if (v.trim()) setReasonError(false)
          }}
          onSubmit={submitReason}
          onCancel={closeInactiveFlow}
        />
      )}

      {successOpen && (
        <AddressPendingSuccessModal onGotIt={acknowledgeSuccess} />
      )}

      {formMode && (
        <AddressFormModal
          key={`${formMode}-${editingAddress?.id ?? 'new'}`}
          mode={formMode}
          companyId={companyId}
          initial={editingAddress}
          onClose={closeForm}
          onSave={saveAddress}
          onEdit={() => setFormMode('edit')}
        />
      )}

      {deleteConfirmId != null && (
        <AddressDeleteConfirmModal
          locationName={currentAddresses.find(a => a.id === deleteConfirmId)?.label ?? 'this address'}
          onCancel={() => setDeleteConfirmId(null)}
          onConfirm={() => removeAddress(deleteConfirmId)}
        />
      )}
    </div>
  )
}

function AddressModalShell({
  children,
  maxWidth = 'max-w-md',
  onClose,
}: {
  children: ReactNode
  maxWidth?: string
  onClose: () => void
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.18)] animate-[fadeIn_0.2s_ease-out]`}>
        {children}
      </div>
    </div>,
    document.body
  )
}

function AddressConfirmInactiveModal({
  onClose,
  onYes,
  onNo,
}: {
  onClose: () => void
  onYes: () => void
  onNo: () => void
}) {
  return (
    <AddressModalShell onClose={onClose}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 w-9 h-9 rounded-xl bg-[#e1c16e]/15 text-[#a1802b] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v4M8 11.2h.01" />
            </svg>
          </span>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-semibold text-slate-900">Confirm inactive</h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Are you sure you want to mark this record as Inactive?
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onNo}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          No
        </button>
        <button
          type="button"
          onClick={onYes}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
        >
          Yes
        </button>
      </div>
    </AddressModalShell>
  )
}

function AddressReasonModal({
  companyId,
  locationName,
  notesHint = 'Address location names will be automatically included in your request',
  entityLabel = 'Location',
  note,
  error,
  onNoteChange,
  onSubmit,
  onCancel,
}: {
  companyId: number
  locationName: string
  notesHint?: string
  entityLabel?: string
  note: string
  error: boolean
  onNoteChange: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <AddressModalShell maxWidth="max-w-lg" onClose={onCancel}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-1 h-4 rounded-full bg-[#12518c]" aria-hidden />
          <h3 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">Reason for Change</h3>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-5">
        <label className="block text-xs text-slate-600 mb-1.5 leading-relaxed">
          {companyId} Notes ({notesHint}){' '}
          <span className="text-[#bb5757]">*</span>
        </label>
        <p className="text-[11px] text-slate-400 mb-2.5">{entityLabel}: {locationName}</p>
        <input
          type="text"
          value={note}
          onChange={e => onNoteChange(e.target.value)}
          className={`w-full h-10 px-3.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] transition-colors ${
            error ? 'border-[#bb5757] bg-danger-light/40' : 'border-slate-200 bg-white'
          }`}
          placeholder="Enter reason for change"
          autoFocus
        />
        {error && (
          <p className="mt-1.5 text-[11px] text-[#bb5757]">Please enter a reason before submitting.</p>
        )}
      </div>
      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
        >
          Submit
        </button>
      </div>
    </AddressModalShell>
  )
}

function AddressPendingSuccessModal({ onGotIt }: { onGotIt: () => void }) {
  return (
    <AddressModalShell onClose={onGotIt}>
      <div className="px-6 pt-7 pb-5 text-center">
        <span className="mx-auto mb-4 w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="7.5" />
            <path d="M6.5 10.2l2.3 2.3 4.7-4.8" />
          </svg>
        </span>
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Update submitted</h3>
        <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
          Your update is pending approval and will be displayed once approved. Click “Got It” to continue.
        </p>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 flex justify-center">
        <button
          type="button"
          onClick={onGotIt}
          className="min-w-[110px] px-5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          Got It
        </button>
      </div>
    </AddressModalShell>
  )
}

const ADDRESS_LOCATION_OPTIONS = [
  'Client Mailing',
  'Client Mailing/Tasting Room',
  'Office',
  'Headquarters',
  'Shipping',
  'Warehouse',
  'Billing',
]

const ADDRESS_STATE_OPTIONS = ['CA', 'NY', 'TX', 'WA', 'OR', 'FL', 'AZ', 'NV', 'CO']
const ADDRESS_COUNTRY_OPTIONS = ['United States', 'Canada', 'Mexico']

type AddressFormData = {
  id?: number
  label: string
  street: string
  streetLabel: string
  streetVariation: string
  city: string
  state: string
  zip: string
  country: string
}

function AddressFormModal({
  mode,
  companyId,
  initial,
  onClose,
  onSave,
  onEdit,
}: {
  mode: 'add' | 'edit' | 'view'
  companyId: number
  initial: AddressRow | null
  onClose: () => void
  onSave: (data: Omit<AddressRow, 'id' | 'active'> & { id?: number }) => void
  onEdit: () => void
}) {
  const readOnly = mode === 'view'
  const [showStreetVariation, setShowStreetVariation] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<'label' | 'street' | 'state' | 'country', boolean>>>({})
  const [form, setForm] = useState<AddressFormData>({
    id: initial?.id,
    label: initial?.label ?? '',
    street: initial?.street ?? '',
    streetLabel: '',
    streetVariation: '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    zip: initial?.zip ?? '',
    country: initial?.country || 'United States',
  })

  const set = <K extends keyof AddressFormData>(key: K, value: AddressFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'label' || key === 'street' || key === 'state' || key === 'country') {
      setErrors(prev => ({ ...prev, [key]: false }))
    }
  }

  const title =
    mode === 'add' ? 'Company — Add Address' : mode === 'edit' ? 'Company — Edit Address' : 'Company — View Address'

  const validateAndSave = () => {
    const next = {
      label: !form.label.trim(),
      street: !form.street.trim(),
      state: !form.state.trim(),
      country: !form.country.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSave({
      id: form.id,
      label: form.label.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zip: form.zip.trim(),
      country: form.country.trim(),
    })
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] ${
      readOnly
        ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-default'
        : hasError
          ? 'bg-white border-[#bb5757] text-slate-900'
          : 'bg-white border-slate-200 text-slate-900'
    }`

  return (
    <AddressModalShell maxWidth="max-w-xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 14s5-3.8 5-7.2A5 5 0 0 0 3 6.8C3 10.2 8 14 8 14z" />
              <circle cx="8" cy="6.8" r="1.6" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
            <p className="text-[11px] text-slate-500">Company ID {companyId}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">
            Location Name <span className="text-[#bb5757]">*</span>
          </span>
          <select
            value={form.label}
            disabled={readOnly}
            onChange={e => set('label', e.target.value)}
            className={`${fieldClass(errors.label)} appearance-none pr-8`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
            }}
          >
            <option value="">Select…</option>
            {ADDRESS_LOCATION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.label && <p className="mt-1 text-[11px] text-[#bb5757]">Location name is required.</p>}
        </label>

        <div>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Street <span className="text-[#bb5757]">*</span>
            </span>
            <input
              type="text"
              value={form.street}
              readOnly={readOnly}
              onChange={e => set('street', e.target.value)}
              className={fieldClass(errors.street)}
              placeholder="Enter street address"
            />
            {errors.street && <p className="mt-1 text-[11px] text-[#bb5757]">Street is required.</p>}
          </label>
          {!readOnly && (
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowStreetVariation(v => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  showStreetVariation
                    ? 'bg-[#12518c]/10 text-[#12518c]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M5 2v6M2 5h6" />
                </svg>
                Variation
              </button>
            </div>
          )}
          {showStreetVariation && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">Label</span>
                <input
                  type="text"
                  value={form.streetLabel}
                  readOnly={readOnly}
                  onChange={e => set('streetLabel', e.target.value)}
                  className={fieldClass()}
                  placeholder="Variation label"
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-slate-600 mb-1.5">Street Variation</span>
                <input
                  type="text"
                  value={form.streetVariation}
                  readOnly={readOnly}
                  onChange={e => set('streetVariation', e.target.value)}
                  className={fieldClass()}
                  placeholder="Alternate street"
                />
              </label>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">City</span>
            <input
              type="text"
              value={form.city}
              readOnly={readOnly}
              onChange={e => set('city', e.target.value)}
              className={fieldClass()}
              placeholder="City"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              State <span className="text-[#bb5757]">*</span>
            </span>
            <select
              value={form.state}
              disabled={readOnly}
              onChange={e => set('state', e.target.value)}
              className={`${fieldClass(errors.state)} appearance-none pr-8`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
              }}
            >
              <option value="">Select…</option>
              {ADDRESS_STATE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-[11px] text-[#bb5757]">State is required.</p>}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Zip Code</span>
            <input
              type="text"
              value={form.zip}
              readOnly={readOnly}
              onChange={e => set('zip', e.target.value)}
              className={fieldClass()}
              placeholder="Zip code"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Country <span className="text-[#bb5757]">*</span>
            </span>
            <div className="relative">
              <select
                value={form.country}
                disabled={readOnly}
                onChange={e => set('country', e.target.value)}
                className={`${fieldClass(errors.country)} appearance-none pr-16`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                }}
              >
                <option value="">Select…</option>
                {ADDRESS_COUNTRY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {!readOnly && form.country && (
                <button
                  type="button"
                  onClick={() => set('country', '')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600"
                  title="Clear"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <path d="M2 2l6 6M8 2l-6 6" />
                  </svg>
                </button>
              )}
            </div>
            {errors.country && <p className="mt-1 text-[11px] text-[#bb5757]">Country is required.</p>}
          </label>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        {mode === 'view' ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors"
            >
              Edit
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={validateAndSave}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors"
            >
              Save
            </button>
          </>
        )}
      </div>
    </AddressModalShell>
  )
}

function AddressDeleteConfirmModal({
  locationName,
  title = 'Delete address',
  onCancel,
  onConfirm,
}: {
  locationName: string
  title?: string
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <AddressModalShell onClose={onCancel}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 w-9 h-9 rounded-xl bg-danger-light text-[#bb5757] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
          </span>
          <div className="min-w-0 pt-0.5">
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-medium text-slate-800">{locationName}</span>? This can’t be undone.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>
      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#bb5757] hover:bg-[#d64549] transition-colors"
        >
          Delete
        </button>
      </div>
    </AddressModalShell>
  )
}

const CONTACT_SPECIALIST_OPTIONS = ['Admin Admin', 'Alissa DeLaRiva', 'AD', 'GL']
const CONTACT_CATEGORY_OPTIONS = ['Individual', 'Shared Email']

function ContactFormModal({
  mode,
  companyId,
  initial,
  onClose,
  onSave,
  onEdit,
}: {
  mode: 'add' | 'edit' | 'view'
  companyId: number
  initial: ContactRow | null
  onClose: () => void
  onSave: (data: Omit<ContactRow, 'id' | 'active' | 'cell'> & { id?: number; cell?: string }) => void
  onEdit: () => void
}) {
  const readOnly = mode === 'view'
  const [errors, setErrors] = useState<Partial<Record<'email' | 'role', boolean>>>({})
  const [form, setForm] = useState({
    id: initial?.id,
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    work: initial?.work ?? '',
    email: initial?.email ?? '',
    street: initial?.street ?? '',
    notes: initial?.notes ?? '',
    specialist: initial?.specialist ?? '',
    category: initial?.category ?? 'Individual',
    cell: initial?.cell ?? '',
  })

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'email' || key === 'role') setErrors(prev => ({ ...prev, [key]: false }))
  }

  const title =
    mode === 'add' ? 'Company — Add Contact' : mode === 'edit' ? 'Company — Edit Contact' : 'Company — View Contact'

  const validateAndSave = () => {
    const next = {
      email: !form.email.trim(),
      role: !form.role.trim(),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    onSave({
      id: form.id,
      name: form.name.trim(),
      role: form.role.trim(),
      work: form.work.trim(),
      email: form.email.trim(),
      street: form.street.trim(),
      notes: form.notes.trim(),
      specialist: form.specialist.trim(),
      category: form.category.trim(),
      cell: form.cell.trim(),
    })
  }

  const fieldClass = (hasError?: boolean) =>
    `w-full h-10 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] ${
      readOnly
        ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-default'
        : hasError
          ? 'bg-white border-[#bb5757] text-slate-900'
          : 'bg-white border-slate-200 text-slate-900'
    }`

  return (
    <AddressModalShell maxWidth="max-w-xl" onClose={onClose}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="8" cy="5.5" r="2.5" />
              <path d="M3 13.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" />
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate">{title}</h3>
            <p className="text-[11px] text-slate-500">Company ID {companyId}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 3l8 8M11 3l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Name</span>
            <input type="text" value={form.name} readOnly={readOnly} onChange={e => set('name', e.target.value)} className={fieldClass()} placeholder="Full name" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Role <span className="text-[#bb5757]">*</span>
            </span>
            <input type="text" value={form.role} readOnly={readOnly} onChange={e => set('role', e.target.value)} className={fieldClass(errors.role)} placeholder="Role" />
            {errors.role && <p className="mt-1 text-[11px] text-[#bb5757]">Role is required.</p>}
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">
              Email <span className="text-[#bb5757]">*</span>
            </span>
            <input type="email" value={form.email} readOnly={readOnly} onChange={e => set('email', e.target.value)} className={fieldClass(errors.email)} placeholder="email@example.com" />
            {errors.email && <p className="mt-1 text-[11px] text-[#bb5757]">Email is required.</p>}
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Work Phone</span>
            <input type="text" value={form.work} readOnly={readOnly} onChange={e => set('work', e.target.value)} className={fieldClass()} placeholder="(000) 000-0000" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Street</span>
            <input type="text" value={form.street} readOnly={readOnly} onChange={e => set('street', e.target.value)} className={fieldClass()} placeholder="Street" />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Cell</span>
            <input type="text" value={form.cell} readOnly={readOnly} onChange={e => set('cell', e.target.value)} className={fieldClass()} placeholder="(000) 000-0000" />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Specialist</span>
            <select
              value={form.specialist}
              disabled={readOnly}
              onChange={e => set('specialist', e.target.value)}
              className={`${fieldClass()} appearance-none pr-8`}
            >
              <option value="">Select…</option>
              {CONTACT_SPECIALIST_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-slate-600 mb-1.5">Category</span>
            <select
              value={form.category}
              disabled={readOnly}
              onChange={e => set('category', e.target.value)}
              className={`${fieldClass()} appearance-none pr-8`}
            >
              {CONTACT_CATEGORY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="block text-xs font-medium text-slate-600 mb-1.5">Notes</span>
          <textarea
            value={form.notes}
            readOnly={readOnly}
            onChange={e => set('notes', e.target.value)}
            rows={3}
            className={`${fieldClass()} h-auto py-2.5 resize-y`}
            placeholder="Optional notes"
          />
        </label>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
        {mode === 'view' ? (
          <>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Close
            </button>
            <button type="button" onClick={onEdit} className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-colors">
              Edit
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={validateAndSave} className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#12518c] hover:bg-[#0e4173] transition-colors">
              Save
            </button>
          </>
        )}
      </div>
    </AddressModalShell>
  )
}

function AddressSearchInput({
  value,
  onChange,
  placeholder = 'Search Here',
  className = 'w-72',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="5" r="3.5" />
        <path d="M8 8l2.5 2.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full pl-8 pr-3 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] transition-all"
      />
    </div>
  )
}

function AddressActiveToggle({
  active,
  onChange,
}: {
  active: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors ${active ? 'bg-[#12518c]' : 'bg-slate-300'}`}
      title={active ? 'Active' : 'Inactive'}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : ''}`} />
    </button>
  )
}

function AddressTableFooter({
  total,
  page,
  onPageChange,
}: {
  total: number
  page: number
  onPageChange: (p: number) => void
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
      <span className="text-sm text-slate-500">
        Total: <span className="font-semibold text-slate-700">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          className="min-w-8 h-8 px-2.5 flex items-center justify-center rounded-lg text-sm font-semibold bg-[#12518c] text-white"
        >
          {page}
        </button>
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-white disabled:opacity-40"
          disabled
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function CompanyDetailPage({
  company,
  companyId,
  editRequest = 0,
}: {
  company: CompanyRow
  companyId: number
  editRequest?: number
}) {
  const [editing, setEditing] = useState(editRequest > 0)
  const [openSection, setOpenSection] = useState('Company Information')
  const [showEinVariations, setShowEinVariations] = useState(false)
  const initialForm = {
    companyId: String(companyId),
    companyType: company.type || 'Client',
    entityTypes: 'LLC',
    status: company.status,
    entityName: company.name,
    dba: company.dba,
    tradeName: '',
    ein: '',
    einLabel: '',
    einVariation: '',
    dhwcEmail: '',
    phone: '',
    extension: '',
    fax: '',
    website: '',
    llcManagement: '',
    taxClassification: '',
    fiscalYearEnd: '',
    operatingAgreementDate: '',
    operatingAgreementAmendmentDate: '',
    originalState: '',
    originalSosNumber: '',
    originalFormationDate: '',
    originalAmendmentDate: '',
    annualCalendarYear: '',
    fermentationGallons: '',
    productionGallons: '',
    bankName: '',
    routingNumber: '',
    account: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  }
  const [form, setForm] = useState(initialForm)
  const [formSnapshot, setFormSnapshot] = useState(initialForm)

  useEffect(() => {
    if (editRequest > 0) {
      setFormSnapshot(form)
      setEditing(true)
    }
  }, [editRequest])

  const set = (key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const startEditing = () => {
    setFormSnapshot(form)
    setEditing(true)
  }

  const cancelEditing = () => {
    setForm(formSnapshot)
    setEditing(false)
  }

  const saveEditing = () => {
    setFormSnapshot(form)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-[fadeIn_0.25s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-[#12518c]/10 text-[#12518c] flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4.5h12M2 8h12M2 11.5h8" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Company Detail</h2>
            <p className="text-xs text-slate-500">Core identity, tax, production, and banking</p>
          </div>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M2 6.5l2.5 2.5L10 3" />
              </svg>
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8.5 1.5l2 2L3.5 10.5H1.5v-2L8.5 1.5z" />
            </svg>
            Edit
          </button>
        )}
      </div>

      <div className="p-5 space-y-3">
        <DetailSection
          title="Company Information"
          open={openSection === 'Company Information'}
          onToggle={() => setOpenSection('Company Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
            <DetailField label="Company ID" value={form.companyId} onChange={v => set('companyId', v)} editing={editing} readOnly />
            <DetailSelect label="Company Type" value={form.companyType} onChange={v => set('companyType', v)} editing={editing} options={['Client', 'Prospect', 'Vendor']} />
            <DetailSelect label="Entity Types" value={form.entityTypes} onChange={v => set('entityTypes', v)} editing={editing} options={['LLC', 'Corporation', 'Partnership', 'Sole Proprietor']} />
            <DetailSelect label="Status" value={form.status} onChange={v => set('status', v)} editing={editing} options={['Active', 'Inactive', 'Archived']} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
            <DetailField label="Entity Name" value={form.entityName} onChange={v => set('entityName', v)} editing={editing} />
            <DetailField label="DBA" value={form.dba} onChange={v => set('dba', v)} editing={editing} />
            <DetailField label="Trade Name" value={form.tradeName} onChange={v => set('tradeName', v)} editing={editing} />
            <DetailField
              label="DHWC Email Address"
              value={form.dhwcEmail}
              onChange={v => set('dhwcEmail', v)}
              editing={editing}
              action={<VariationButton />}
            />
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
              <div className="sm:col-span-2">
                <DetailField
                  label="EIN"
                  value={form.ein}
                  onChange={v => set('ein', v)}
                  editing={editing}
                  action={
                    <VariationButton
                      active={showEinVariations}
                      onClick={() => setShowEinVariations(v => !v)}
                    />
                  }
                />
              </div>
              {showEinVariations && (
                <>
                  <DetailField
                    label="Label"
                    value={form.einLabel}
                    onChange={v => set('einLabel', v)}
                    editing={editing}
                  />
                  <DetailField
                    label="EIN Variation"
                    value={form.einVariation}
                    onChange={v => set('einVariation', v)}
                    editing={editing}
                  />
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 mt-4">
            <DetailField label="Phone" value={form.phone} onChange={v => set('phone', v)} editing={editing} />
            <DetailField label="Extension" value={form.extension} onChange={v => set('extension', v)} editing={editing} />
            <DetailField label="Fax" value={form.fax} onChange={v => set('fax', v)} editing={editing} />
            <DetailField label="Website" value={form.website} onChange={v => set('website', v)} editing={editing} />
          </div>
        </DetailSection>

        <DetailSection
          title="Entity / Tax Information"
          open={openSection === 'Entity / Tax Information'}
          onToggle={() => setOpenSection('Entity / Tax Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            <DetailSelect label="LLC Management" value={form.llcManagement} onChange={v => set('llcManagement', v)} editing={editing} options={['Member Managed', 'Manager Managed']} placeholder="Select…" />
            <DetailSelect label="Tax Classification" value={form.taxClassification} onChange={v => set('taxClassification', v)} editing={editing} options={['Partnership', 'S-Corp', 'C-Corp', 'Disregarded Entity']} placeholder="Select…" />
            <DetailField label="Fiscal Year End Month and Day" value={form.fiscalYearEnd} onChange={v => set('fiscalYearEnd', v)} editing={editing} placeholder="MM/DD" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 mt-4">
            <DetailField label="Operating Agreement Date" value={form.operatingAgreementDate} onChange={v => set('operatingAgreementDate', v)} editing={editing} placeholder="MM/DD/YYYY" />
            <DetailField label="Operating Agreement Amendment Date" value={form.operatingAgreementAmendmentDate} onChange={v => set('operatingAgreementAmendmentDate', v)} editing={editing} placeholder="MM/DD/YYYY" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4 mt-4">
            <DetailSelect label="Original State of formation" value={form.originalState} onChange={v => set('originalState', v)} editing={editing} options={['CA', 'NY', 'TX', 'WA', 'OR', 'FL']} placeholder="Select…" />
            <DetailField label="Original Secretary of State number" value={form.originalSosNumber} onChange={v => set('originalSosNumber', v)} editing={editing} />
            <DetailField label="Original Formation Date" value={form.originalFormationDate} onChange={v => set('originalFormationDate', v)} editing={editing} placeholder="MM/DD/YYYY" />
            <DetailField label="Original Amendment Date" value={form.originalAmendmentDate} onChange={v => set('originalAmendmentDate', v)} editing={editing} placeholder="MM/DD/YYYY" />
          </div>
        </DetailSection>

        <DetailSection
          title="Production Information"
          open={openSection === 'Production Information'}
          onToggle={() => setOpenSection('Production Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
            <DetailField label="Annual Calendar Year" value={form.annualCalendarYear} onChange={v => set('annualCalendarYear', v)} editing={editing} placeholder="YYYY" />
            <DetailField label="Annual calendar year fermentation total in gallons" value={form.fermentationGallons} onChange={v => set('fermentationGallons', v)} editing={editing} />
            <DetailField label="Annual calendar year total production in gallons – produced onsite or off" value={form.productionGallons} onChange={v => set('productionGallons', v)} editing={editing} />
          </div>
        </DetailSection>

        <DetailSection
          title="Bank Information"
          open={openSection === 'Bank Information'}
          onToggle={() => setOpenSection('Bank Information')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-4 gap-y-4">
            <DetailField label="Bank Name" value={form.bankName} onChange={v => set('bankName', v)} editing={editing} />
            <DetailField label="Routing Number" value={form.routingNumber} onChange={v => set('routingNumber', v)} editing={editing} />
            <DetailField label="Account" value={form.account} onChange={v => set('account', v)} editing={editing} />
            <DetailField label="Street" value={form.street} onChange={v => set('street', v)} editing={editing} />
            <DetailField label="City" value={form.city} onChange={v => set('city', v)} editing={editing} />
            <DetailSelect label="State" value={form.state} onChange={v => set('state', v)} editing={editing} options={['CA', 'NY', 'TX', 'WA', 'OR', 'FL']} placeholder="Select…" />
            <DetailField label="Zip Code" value={form.zipCode} onChange={v => set('zipCode', v)} editing={editing} />
            <DetailSelect label="Country" value={form.country} onChange={v => set('country', v)} editing={editing} options={['United States', 'Canada', 'Mexico']} />
          </div>
        </DetailSection>
      </div>
    </div>
  )
}

function DetailSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className={`rounded-xl border overflow-hidden transition-colors ${
      open ? 'border-[#12518c]/30' : 'border-slate-200/80'
    }`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors ${
          open ? 'bg-[#12518c]/5 border-b border-[#12518c]/15' : 'bg-slate-50 hover:bg-slate-100/80'
        }`}
      >
        <span
          className={`w-1 h-4 rounded-full flex-shrink-0 transition-colors ${
            open ? 'bg-[#12518c]' : 'bg-slate-300'
          }`}
          aria-hidden
        />
        <h3 className={`flex-1 text-xs font-semibold tracking-wide uppercase transition-colors ${
          open ? 'text-[#12518c]' : 'text-slate-500'
        }`}>
          {title}
        </h3>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-[#12518c]' : 'text-slate-400'
          }`}
          aria-hidden
        >
          <path d="M3.5 5.25L7 8.75l3.5-3.5" />
        </svg>
      </button>
      {open && <div className="p-4 bg-white">{children}</div>}
    </section>
  )
}

function VariationButton({
  onClick,
  active = false,
}: {
  onClick?: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[11px] font-semibold transition-colors ${
        active
          ? 'text-[#0e4173]'
          : 'text-[#12518c] hover:text-[#0e4173]'
      }`}
    >
      Variation
    </button>
  )
}

const detailControlClass =
  'w-full h-9 px-3 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c]'

function DetailField({
  label,
  value,
  onChange,
  editing,
  readOnly,
  placeholder,
  action,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  editing: boolean
  readOnly?: boolean
  placeholder?: string
  action?: ReactNode
}) {
  const locked = !editing || readOnly
  return (
    <label className="block min-w-0">
      <span className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-medium text-slate-500 leading-tight">{label}</span>
        {action}
      </span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={locked}
        placeholder={placeholder}
        className={`${detailControlClass} ${
          locked
            ? 'bg-slate-50/80 border-slate-200 text-slate-700 cursor-default'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      />
    </label>
  )
}

function DetailSelect({
  label,
  value,
  onChange,
  editing,
  options,
  placeholder = 'Select…',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  editing: boolean
  options: string[]
  placeholder?: string
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] font-medium text-slate-500 mb-1.5 leading-tight">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={!editing}
        className={`${detailControlClass} appearance-none pr-8 bg-[length:12px] bg-[right_0.75rem_center] bg-no-repeat ${
          editing
            ? 'bg-white border-slate-300 text-slate-900 cursor-pointer'
            : 'bg-slate-50/80 border-slate-200 text-slate-700 cursor-default'
        }`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        }}
      >
        {!value && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  )
}

function SummaryCard({
  title,
  count,
  actions,
  children,
  bodyClassName = '',
  fill = false,
}: {
  title: string
  count?: number
  actions?: ReactNode
  children: ReactNode
  bodyClassName?: string
  fill?: boolean
}) {
  return (
    <section className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-shadow hover:shadow-md ${fill ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
          {typeof count === 'number' && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {count}
            </span>
          )}
        </div>
        {actions}
      </div>
      <div className={`p-4 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

function CompanyStatusBadge({ status, alert }: { status: 'Archived' | 'Active' | 'Inactive'; alert?: boolean }) {
  if (alert) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-danger-light text-danger border-danger-border">
        {status}
      </span>
    )
  }
  const map = {
    Archived: 'bg-[#bb5757] text-white border-transparent',
    Active: 'bg-teal-500 text-white border-transparent',
    Inactive: 'bg-slate-400 text-white border-transparent',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status]}`}>
      {status}
    </span>
  )
}

function useTableColumns<T extends string>(columnDefs: readonly { key: T; label: string }[]) {
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(columnDefs.map(c => [c.key, true])) as Record<T, boolean>
  )

  const toggle = (key: string) => {
    setVisible(prev => {
      const k = key as T
      const nextVisible = !prev[k]
      if (!nextVisible && Object.values(prev).filter(Boolean).length <= 1) return prev
      return { ...prev, [k]: nextVisible }
    })
  }

  const visibleCount = columnDefs.filter(c => visible[c.key]).length

  return {
    show: (key: T) => visible[key],
    visibleCount,
    dropdownProps: {
      columns: columnDefs.map(c => ({ key: c.key, label: c.label, visible: visible[c.key] })),
      onToggle: toggle,
    },
  }
}

function ColumnSettingsDropdown({
  columns,
  onToggle,
  buttonClassName = 'p-2 rounded-lg transition-all duration-200',
}: {
  columns: { key: string; label: string; visible: boolean }[]
  onToggle: (key: string) => void
  buttonClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setMounted(false)
      return
    }
    const id = requestAnimationFrame(() => setMounted(true))
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title="Column settings"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${buttonClassName} ${
          open
            ? 'bg-slate-100 text-slate-700'
            : 'hover:bg-slate-100 text-slate-500'
        }`}
      >
        <GridViewIcon />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 top-full mt-2 z-50 w-48 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out ${
            mounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-1'
          }`}
        >
          <div className="px-3.5 pb-2 mb-1 border-b border-slate-100">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase">Show / Hide</p>
          </div>
          <div className="py-0.5">
            {columns.map(col => (
              <button
                key={col.key}
                type="button"
                role="menuitemcheckbox"
                aria-checked={col.visible}
                onClick={() => onToggle(col.key)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`w-4 h-4 rounded-[3px] flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                    col.visible
                      ? 'bg-slate-600 text-white shadow-sm'
                      : 'border border-slate-300 bg-white'
                  }`}
                >
                  {col.visible && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 5.2L4.2 7.5 8 2.5" />
                    </svg>
                  )}
                </span>
                <span className="font-medium">{col.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Mini components ─────────────────────────────────────────────── */

function AlertDropdown({ status, onChange }: { status: AlertStatus; onChange: (s: AlertStatus) => void }) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPos(null)
      return
    }
    const updatePos = () => {
      const rect = buttonRef.current!.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 6, left: rect.left })
    }
    updatePos()
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const badge =
    status === 'Pending'
      ? { label: 'Pending', bg: 'bg-[#e1c16e]/15', text: 'text-[#a1802b]', border: 'border-[#e1c16e]/60', dot: 'bg-[#e1c16e]' }
      : status === 'Work Stop'
      ? { label: 'Work Stop', bg: 'bg-danger-light', text: 'text-danger', border: 'border-danger-border', dot: 'bg-danger' }
      : { label: 'No Alert', bg: 'bg-slate-50', text: 'text-slate-400', border: 'border-slate-200', dot: 'bg-slate-300' }

  const menu = open && menuPos && createPortal(
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
      className="z-[9999] bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-44 text-sm"
    >
      <button
        onClick={() => { onChange('Pending'); setOpen(false) }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
      >
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#e1c16e" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="7" cy="7" r="2" fill="#e1c16e" />
          </svg>
        </span>
        Set to Pending
      </button>
      <button
        onClick={() => { onChange('Work Stop'); setOpen(false) }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-700 transition-colors"
      >
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        Set to Work Stop
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button
        onClick={() => { onChange(null); setOpen(false) }}
        className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 text-slate-500 transition-colors"
      >
        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M4.5 7h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        Clear Status
      </button>
    </div>,
    document.body
  )

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors hover:brightness-95 ${badge.bg} ${badge.text} ${badge.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${badge.dot}`} />
        {badge.label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
          <path d="M2.5 4l2.5 2.5L7.5 4" />
        </svg>
      </button>
      {menu}
    </div>
  )
}

function StatusBadge({ status, alert }: { status: string; alert?: boolean }) {
  const map: Record<string, string> = {
    Archived: 'bg-slate-100 text-slate-600 border-slate-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Expired: 'bg-danger-light text-danger border-danger-border',
  }
  const classes = alert
    ? 'bg-danger-light text-danger border-danger-border'
    : (map[status] ?? 'bg-slate-100 text-slate-600')
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {status}
    </span>
  )
}

function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="5" r="3.5" />
        <path d="M8 8l2.5 2.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#12518c]/30 focus:border-[#12518c] w-36 transition-all"
      />
    </div>
  )
}

function filterSelectClassName(value: string, extra = '') {
  const active = !!value
  return `h-9 min-w-[140px] px-2.5 rounded-lg border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#12518c]/25 focus:border-[#12518c] transition-colors cursor-pointer ${extra} ${
    active
      ? 'border-[#12518c] ring-1 ring-[#12518c]/20 text-slate-800 font-medium'
      : 'border-slate-200 text-slate-500'
  }`
}

function FilterSelect({
  label,
  value,
  onChange,
  options = [],
  className,
  'aria-label': ariaLabel,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options?: readonly string[] | string[]
  className?: string
  'aria-label'?: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={ariaLabel ?? label}
      className={className ?? filterSelectClassName(value)}
    >
      <option value="">{label}</option>
      {options.filter(o => o !== 'All').map(option => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
  )
}

function Select({
  placeholder,
  options = [],
  value: controlledValue,
  onChange,
}: {
  placeholder: string
  options?: string[]
  value?: string
  onChange?: (value: string) => void
}) {
  const [internalValue, setInternalValue] = useState('')
  const value = controlledValue ?? internalValue
  const handleChange = onChange ?? setInternalValue

  return (
    <FilterSelect
      label={placeholder}
      value={value}
      onChange={handleChange}
      options={options}
      className={filterSelectClassName(value, 'py-1.5 bg-slate-50')}
    />
  )
}

function GridViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <rect x="1" y="1" width="5" height="5" rx="1" />
      <rect x="8" y="1" width="5" height="5" rx="1" />
      <rect x="1" y="8" width="5" height="5" rx="1" />
      <rect x="8" y="8" width="5" height="5" rx="1" />
    </svg>
  )
}

/* ── Sidebar icons ───────────────────────────────────────────────── */

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={active ? '#12518c' : 'currentColor'} className="flex-shrink-0">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  )
}

function WineIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <path d="M5 2h6l-1 5a3 3 0 0 1-4 0L5 2z" />
      <path d="M8 7v7M5.5 14h5" />
    </svg>
  )
}

function BuildingIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="2" y="4" width="12" height="10" rx="1" />
      <path d="M5 14V8h6v6M8 4V2" />
    </svg>
  )
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 14c0-3 2-4.5 5-4.5s5 1.5 5 4.5" />
      <path d="M11 3a2.5 2.5 0 0 1 0 5M15 14c0-2.5-1.5-4-4-4" />
    </svg>
  )
}

function AgencyIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M2 14V7l6-5 6 5v7H2z" />
      <rect x="6" y="10" width="4" height="4" />
    </svg>
  )
}

function QueryIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <circle cx="7" cy="7" r="5" />
      <path d="M12.5 12.5L15 15" />
    </svg>
  )
}

function LicenseIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="3" y="2" width="10" height="12" rx="1.5" />
      <path d="M6 6h4M6 9h4M6 12h2" />
    </svg>
  )
}

function ReportIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M2 12V4l4 4 3-4 5 6" />
    </svg>
  )
}

function BulkIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M2 4h12M2 8h12M2 12h8" />
    </svg>
  )
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#12518c' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 15c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" />
    </svg>
  )
}
