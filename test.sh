#!/bin/bash

# Base URLs
USERS_URL="http://localhost:3000/api/users"
POSTS_URL="http://localhost:3000/api/posts"
LIKES_URL="http://localhost:3000/api/likes"
FOLLOWS_URL="http://localhost:3000/api/follows"
API_URL="http://localhost:3000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    if [ "$method" = "GET" ]; then
        curl -s -X $method "$endpoint" | jq .
    else
        curl -s -X $method "$endpoint" -H "Content-Type: application/json" -d "$data" | jq .
    fi
    echo ""
}

# User-related functions
test_get_all_users() {
    print_header "Testing GET all users"
    make_request "GET" "$USERS_URL"
}

test_get_user() {
    print_header "Testing GET user by ID"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id"
}

test_create_user() {
    print_header "Testing POST create user"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email
    
    local user_data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email"
}
EOF
)
    make_request "POST" "$USERS_URL" "$user_data"
}

test_update_user() {
    print_header "Testing PUT update user"
    read -p "Enter user ID to update: " user_id
    read -p "Enter new first name (press Enter to keep current): " firstName
    read -p "Enter new last name (press Enter to keep current): " lastName
    read -p "Enter new email (press Enter to keep current): " email
    
    local update_data="{"
    local has_data=false
    
    if [ -n "$firstName" ]; then
        update_data+="\"firstName\": \"$firstName\""
        has_data=true
    fi
    
    if [ -n "$lastName" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"lastName\": \"$lastName\""
        has_data=true
    fi
    
    if [ -n "$email" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"email\": \"$email\""
        has_data=true
    fi
    
    update_data+="}"
    
    make_request "PUT" "$USERS_URL/$user_id" "$update_data"
}

test_delete_user() {
    print_header "Testing DELETE user"
    read -p "Enter user ID to delete: " user_id
    make_request "DELETE" "$USERS_URL/$user_id"
}

# Post-related functions
test_get_all_posts() {
    print_header "Testing GET all posts"
    make_request "GET" "$POSTS_URL"
}

test_get_post() {
    print_header "Testing GET post by ID"
    read -p "Enter post ID: " post_id
    make_request "GET" "$POSTS_URL/$post_id"
}

test_create_post() {
    print_header "Testing POST create post"
    read -p "Enter post content: " content
    read -p "Enter author ID: " authorId
    
    local post_data=$(cat <<EOF
{
    "content": "$content",
    "authorId": $authorId
}
EOF
)
    make_request "POST" "$POSTS_URL" "$post_data"
}

test_update_post() {
    print_header "Testing PUT update post"
    read -p "Enter post ID to update: " post_id
    read -p "Enter new content: " content
    
    local update_data=$(cat <<EOF
{
    "content": "$content"
}
EOF
)
    
    make_request "PUT" "$POSTS_URL/$post_id" "$update_data"
}

test_delete_post() {
    print_header "Testing DELETE post"
    read -p "Enter post ID to delete: " post_id
    make_request "DELETE" "$POSTS_URL/$post_id"
}

# Like-related functions
test_get_all_likes() {
    print_header "Testing GET all likes"
    make_request "GET" "$LIKES_URL"
}

test_get_like() {
    print_header "Testing GET like by ID"
    read -p "Enter like ID: " like_id
    make_request "GET" "$LIKES_URL/$like_id"
}

test_create_like() {
    print_header "Testing POST create like"
    read -p "Enter user ID: " userId
    read -p "Enter post ID: " postId
    
    local like_data=$(cat <<EOF
{
    "userId": $userId,
    "postId": $postId
}
EOF
)
    make_request "POST" "$LIKES_URL" "$like_data"
}

test_delete_like() {
    print_header "Testing DELETE like"
    read -p "Enter user ID: " userId
    read -p "Enter post ID: " postId
    
    local delete_data=$(cat <<EOF
{
    "userId": $userId,
    "postId": $postId
}
EOF
)
    
    make_request "DELETE" "$LIKES_URL" "$delete_data"
}

# Follow-related functions
test_get_all_follows() {
    print_header "Testing GET all follows"
    make_request "GET" "$FOLLOWS_URL"
}

test_get_follow() {
    print_header "Testing GET follow by ID"
    read -p "Enter follow ID: " follow_id
    make_request "GET" "$FOLLOWS_URL/$follow_id"
}

test_create_follow() {
    print_header "Testing POST create follow"
    read -p "Enter follower ID: " followerId
    read -p "Enter following ID: " followingId
    
    local follow_data=$(cat <<EOF
{
    "followerId": $followerId,
    "followingId": $followingId
}
EOF
)
    make_request "POST" "$FOLLOWS_URL" "$follow_data"
}

test_delete_follow() {
    print_header "Testing DELETE follow"
    read -p "Enter follower ID: " followerId
    read -p "Enter following ID: " followingId
    
    local delete_data=$(cat <<EOF
{
    "followerId": $followerId,
    "followingId": $followingId
}
EOF
)
    
    make_request "DELETE" "$FOLLOWS_URL" "$delete_data"
}

# Special endpoint tests
test_user_feed() {
    print_header "Testing GET user feed"
    read -p "Enter user ID: " userId
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local endpoint="$API_URL/feed?userId=$userId"
    
    if [ -n "$limit" ]; then
        endpoint+="&limit=$limit"
    fi
    
    if [ -n "$offset" ]; then
        endpoint+="&offset=$offset"
    fi
    
    make_request "GET" "$endpoint"
}

test_posts_by_hashtag() {
    print_header "Testing GET posts by hashtag"
    read -p "Enter hashtag (without #): " tag
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local endpoint="$API_URL/posts/hashtag/$tag"
    
    if [ -n "$limit" ]; then
        endpoint+="?limit=$limit"
    else
        endpoint+="?limit=10"
    fi
    
    if [ -n "$offset" ]; then
        endpoint+="&offset=$offset"
    fi
    
    make_request "GET" "$endpoint"
}

test_user_followers() {
    print_header "Testing GET user followers"
    read -p "Enter user ID: " user_id
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local endpoint="$API_URL/users/$user_id/followers"
    
    if [ -n "$limit" ]; then
        endpoint+="?limit=$limit"
    else
        endpoint+="?limit=10"
    fi
    
    if [ -n "$offset" ]; then
        endpoint+="&offset=$offset"
    fi
    
    make_request "GET" "$endpoint"
}

test_user_activity() {
    print_header "Testing GET user activity"
    read -p "Enter user ID: " user_id
    read -p "Enter activity type (post, like, follow or press Enter for all): " type
    read -p "Enter start date (YYYY-MM-DD or press Enter to skip): " startDate
    read -p "Enter end date (YYYY-MM-DD or press Enter to skip): " endDate
    read -p "Enter limit (or press Enter for default): " limit
    read -p "Enter offset (or press Enter for default): " offset
    
    local endpoint="$API_URL/users/$user_id/activity?"
    local params=()
    
    if [ -n "$type" ]; then
        params+=("type=$type")
    fi
    
    if [ -n "$startDate" ]; then
        params+=("startDate=$startDate")
    fi
    
    if [ -n "$endDate" ]; then
        params+=("endDate=$endDate")
    fi
    
    if [ -n "$limit" ]; then
        params+=("limit=$limit")
    fi
    
    if [ -n "$offset" ]; then
        params+=("offset=$offset")
    fi
    
    local query_string=$(IFS="&"; echo "${params[*]}")
    endpoint+="$query_string"
    
    make_request "GET" "$endpoint"
}

# Special endpoints menu
show_special_endpoints_menu() {
    echo -e "\n${GREEN}Special Endpoints Menu${NC}"
    echo "1. Get user feed"
    echo "2. Get posts by hashtag"
    echo "3. Get user followers"
    echo "4. Get user activity"
    echo "5. Back to main menu"
    echo -n "Enter your choice (1-5): "
}

# Entity submenus
show_users_menu() {
    echo -e "\n${GREEN}Users Menu${NC}"
    echo "1. Get all users"
    echo "2. Get user by ID"
    echo "3. Create new user"
    echo "4. Update user"
    echo "5. Delete user"
    echo "6. Back to main menu"
    echo -n "Enter your choice (1-6): "
}

show_posts_menu() {
    echo -e "\n${GREEN}Posts Menu${NC}"
    echo "1. Get all posts"
    echo "2. Get post by ID"
    echo "3. Create new post"
    echo "4. Update post"
    echo "5. Delete post"
    echo "6. Back to main menu"
    echo -n "Enter your choice (1-6): "
}

show_likes_menu() {
    echo -e "\n${GREEN}Likes Menu${NC}"
    echo "1. Get all likes"
    echo "2. Get like by ID"
    echo "3. Create new like"
    echo "4. Delete like"
    echo "5. Back to main menu"
    echo -n "Enter your choice (1-5): "
}

show_follows_menu() {
    echo -e "\n${GREEN}Follows Menu${NC}"
    echo "1. Get all follows"
    echo "2. Get follow by ID"
    echo "3. Create new follow"
    echo "4. Delete follow"
    echo "5. Back to main menu"
    echo -n "Enter your choice (1-5): "
}

# Main menu
show_main_menu() {
    echo -e "\n${GREEN}API Testing Menu${NC}"
    echo "1. Users"
    echo "2. Posts"
    echo "3. Likes"
    echo "4. Follows"
    echo "5. Special Endpoints"
    echo "6. Exit"
    echo -n "Enter your choice (1-6): "
}

# Main loop
while true; do
    show_main_menu
    read choice
    case $choice in
        1)
            while true; do
                show_users_menu
                read user_choice
                case $user_choice in
                    1) test_get_all_users ;;
                    2) test_get_user ;;
                    3) test_create_user ;;
                    4) test_update_user ;;
                    5) test_delete_user ;;
                    6) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        2)
            while true; do
                show_posts_menu
                read post_choice
                case $post_choice in
                    1) test_get_all_posts ;;
                    2) test_get_post ;;
                    3) test_create_post ;;
                    4) test_update_post ;;
                    5) test_delete_post ;;
                    6) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        3)
            while true; do
                show_likes_menu
                read like_choice
                case $like_choice in
                    1) test_get_all_likes ;;
                    2) test_get_like ;;
                    3) test_create_like ;;
                    4) test_delete_like ;;
                    5) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        4)
            while true; do
                show_follows_menu
                read follow_choice
                case $follow_choice in
                    1) test_get_all_follows ;;
                    2) test_get_follow ;;
                    3) test_create_follow ;;
                    4) test_delete_follow ;;
                    5) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        5)
            while true; do
                show_special_endpoints_menu
                read special_choice
                case $special_choice in
                    1) test_user_feed ;;
                    2) test_posts_by_hashtag ;;
                    3) test_user_followers ;;
                    4) test_user_activity ;;
                    5) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        6) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice. Please try again." ;;
    esac
done 