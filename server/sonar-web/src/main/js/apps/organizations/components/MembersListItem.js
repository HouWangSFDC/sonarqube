/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
//@flow
import React from 'react';
import RemoveMemberForm from './forms/RemoveMemberForm';
import ManageMemberGroupsForm from './forms/ManageMemberGroupsForm';
import Avatar from '../../../components/ui/Avatar';
import { translate, translateWithParameters } from '../../../helpers/l10n';
import { formatMeasure } from '../../../helpers/measures';
import ActionsDropdown, {
  ActionsDropdownDivider,
  ActionsDropdownItem
} from '../../../components/controls/ActionsDropdown';
/*:: import type { Member } from '../../../store/organizationsMembers/actions'; */
/*:: import type { Organization, OrgGroup } from '../../../store/organizations/duck'; */

/*::
type Props = {
  member: Member,
  organization: Organization,
  organizationGroups: Array<OrgGroup>,
  removeMember: Member => void,
  updateMemberGroups: (member: Member, add: Array<string>, remove: Array<string>) => void
};

type State = {
  removeMemberForm: bool,
  manageGroupsForm: bool
}
*/

const AVATAR_SIZE /*: number */ = 36;

export default class MembersListItem extends React.PureComponent {
  mounted /*: bool */ = false;
  /*:: props: Props; */
  state /*: State */ = { removeMemberForm: false, manageGroupsForm: false };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleManageGroupsClick = () => {
    this.setState({ manageGroupsForm: true });
  };

  closeManageGroupsForm = () => {
    if (this.mounted) {
      this.setState({ manageGroupsForm: false });
    }
  };

  handleRemoveMemberClick = () => {
    this.setState({ removeMemberForm: true });
  };

  closeRemoveMemberForm = () => {
    if (this.mounted) {
      this.setState({ removeMemberForm: false });
    }
  };

  render() {
    const { member, organization } = this.props;
    return (
      <tr>
        <td className="thin nowrap">
          <Avatar hash={member.avatar} name={member.name} size={AVATAR_SIZE} />
        </td>
        <td className="nowrap text-middle">
          <strong>{member.name}</strong>
          <span className="note little-spacer-left">{member.login}</span>
        </td>
        {organization.canAdmin && (
          <td className="text-right text-middle">
            {translateWithParameters(
              'organization.members.x_groups',
              formatMeasure(member.groupCount || 0, 'INT')
            )}
          </td>
        )}
        {organization.canAdmin && (
          <React.Fragment>
            <td className="nowrap text-middle text-right">
              <ActionsDropdown>
                <ActionsDropdownItem onClick={this.handleManageGroupsClick}>
                  {translate('organization.members.manage_groups')}
                </ActionsDropdownItem>
                <ActionsDropdownDivider />
                <ActionsDropdownItem destructive={true} onClick={this.handleRemoveMemberClick}>
                  {translate('organization.members.remove')}
                </ActionsDropdownItem>
              </ActionsDropdown>
            </td>

            {this.state.manageGroupsForm && (
              <ManageMemberGroupsForm
                member={this.props.member}
                onClose={this.closeManageGroupsForm}
                organization={this.props.organization}
                organizationGroups={this.props.organizationGroups}
                updateMemberGroups={this.props.updateMemberGroups}
              />
            )}

            {this.state.removeMemberForm && (
              <RemoveMemberForm
                member={this.props.member}
                onClose={this.closeRemoveMemberForm}
                organization={this.props.organization}
                removeMember={this.props.removeMember}
              />
            )}
          </React.Fragment>
        )}
      </tr>
    );
  }
}
