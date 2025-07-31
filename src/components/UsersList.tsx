import React from 'react';
import { Crown, User, Eye, Settings } from 'lucide-react';
import { Button } from './ui/Button';
import { socketService } from '../services/socketService';
import { cn } from '../lib/utils';
import type { User as UserType } from '../store/slices/presentationSlice';

interface UsersListProps {
  users: UserType[];
  currentUserId: string;
  currentUserRole: 'owner' | 'editor' | 'viewer';
  presentationId: string;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  currentUserId,
  currentUserRole,
  presentationId,
}) => {
  const canManageUsers = currentUserRole === 'owner';

  const handleRoleChange = (userId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    if (!canManageUsers || userId === currentUserId) return;
    
    if (newRole === 'owner') {
      if (confirm('Are you sure you want to transfer ownership? You will become an editor.')) {
        socketService.updateUserRole(presentationId, userId, newRole);
      }
    } else {
      socketService.updateUserRole(presentationId, userId, newRole);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'editor':
        return <Settings className="w-4 h-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'editor':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'viewer':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    // Owner first, then editors, then viewers
    const roleOrder = { owner: 0, editor: 1, viewer: 2 };
    const aOrder = roleOrder[a.role as keyof typeof roleOrder] ?? 3;
    const bOrder = roleOrder[b.role as keyof typeof roleOrder] ?? 3;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Current user first within same role
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    
    // Then by nickname
    return a.nickname.localeCompare(b.nickname);
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Participants</h3>
        <span className="text-sm text-gray-500">{users.length} online</span>
      </div>

      <div className="space-y-2">
        {sortedUsers.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const canChangeRole = canManageUsers && !isCurrentUser;

          return (
            <div
              key={user.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border',
                isCurrentUser
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-white border-gray-200'
              )}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                  {user.nickname.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isCurrentUser ? 'text-primary' : 'text-gray-900'
                    )}>
                      {user.nickname}
                      {isCurrentUser && ' (You)'}
                    </p>
                  </div>
                  
                  {/* Role Badge */}
                  <div className="flex items-center space-x-1 mt-1">
                    {getRoleIcon(user.role)}
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full border capitalize',
                      getRoleColor(user.role)
                    )}>
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Management */}
              {canChangeRole && (
                <div className="flex flex-col space-y-1">
                  {user.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2 text-yellow-600 hover:bg-yellow-50"
                      onClick={() => handleRoleChange(user.id, 'owner')}
                    >
                      Make Owner
                    </Button>
                  )}
                  {user.role !== 'editor' && user.role !== 'owner' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleRoleChange(user.id, 'editor')}
                    >
                      Make Editor
                    </Button>
                  )}
                  {user.role !== 'viewer' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs px-2 text-gray-600 hover:bg-gray-50"
                      onClick={() => handleRoleChange(user.id, 'viewer')}
                    >
                      Make Viewer
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Role Descriptions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Roles</h4>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span><strong>Owner:</strong> Full control, can manage users</span>
          </div>
          <div className="flex items-center space-x-2">
            <Settings className="w-3 h-3 text-blue-500" />
            <span><strong>Editor:</strong> Can edit slides and content</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="w-3 h-3 text-gray-500" />
            <span><strong>Viewer:</strong> Can only view the presentation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;