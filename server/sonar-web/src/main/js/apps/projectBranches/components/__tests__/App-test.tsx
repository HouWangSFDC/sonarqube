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
/* eslint-disable import/first, import/order */
jest.mock('../../../../api/settings', () => ({
  getValues: jest.fn(() => Promise.resolve([]))
}));

import * as React from 'react';
import { mount, shallow } from 'enzyme';
import App from '../App';
import {
  BranchType,
  LongLivingBranch,
  ShortLivingBranch,
  MainBranch,
  PullRequest
} from '../../../../app/types';

const getValues = require('../../../../api/settings').getValues as jest.Mock<any>;

beforeEach(() => {
  getValues.mockClear();
});

it('renders sorted list of branches', () => {
  const branchLikes: [
    MainBranch,
    LongLivingBranch,
    ShortLivingBranch,
    PullRequest,
    ShortLivingBranch
  ] = [
    { isMain: true, name: 'master' },
    { isMain: false, name: 'branch-1.0', type: BranchType.LONG },
    { isMain: false, mergeBranch: 'master', name: 'feature', type: BranchType.SHORT },
    { base: 'master', branch: 'feature', key: '1234', title: 'Feature PR' },
    {
      isMain: false,
      mergeBranch: 'foobar',
      isOrphan: true,
      name: 'feature',
      type: BranchType.SHORT
    }
  ];
  const wrapper = shallow(
    <App
      branchLikes={branchLikes}
      canAdmin={true}
      component={{ key: 'foo' }}
      onBranchesChange={jest.fn()}
    />
  );
  wrapper.setState({ branchLifeTime: '100', loading: false });
  expect(wrapper).toMatchSnapshot();
});

it('fetches branch life time setting on mount', () => {
  mount(<App branchLikes={[]} component={{ key: 'foo' }} onBranchesChange={jest.fn()} />);
  expect(getValues).toBeCalledWith({
    keys: 'sonar.dbcleaner.daysBeforeDeletingInactiveShortLivingBranches'
  });
});
